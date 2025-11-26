#!/bin/bash

# Script de déploiement manuel pour VPS
# Usage: ./scripts/deploy-to-vps.sh [production|staging]

set -e

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
APP_NAME="afrikipresse"
APP_PORT=3001
BUILD_DIR="./build-${ENVIRONMENT}"

echo -e "${BLUE}🚀 Starting deployment for ${APP_NAME} (${ENVIRONMENT})${NC}"

# Vérifier les variables d'environnement requises
if [ -z "$VPS_HOST" ] || [ -z "$VPS_USER" ]; then
    echo -e "${RED}❌ Error: VPS_HOST and VPS_USER environment variables must be set${NC}"
    echo "Export them first:"
    echo "  export VPS_HOST=your-vps-ip"
    echo "  export VPS_USER=your-username"
    exit 1
fi

# Fonction pour afficher les étapes
step() {
    echo -e "${GREEN}▶ $1${NC}"
}

# Fonction pour les erreurs
error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

# Fonction pour les avertissements
warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# 1. Nettoyer l'ancien build
step "Cleaning old build directory..."
rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR

# 2. Installer les dépendances
step "Installing dependencies..."
npm ci --legacy-peer-deps || error "Failed to install dependencies"

# 3. Générer Prisma Client
step "Generating Prisma Client..."
npx prisma generate || error "Failed to generate Prisma Client"

# 4. Build de l'application
step "Building application..."
NODE_ENV=production npm run build || error "Build failed"

# 5. Copier les fichiers nécessaires
step "Copying necessary files to build directory..."
cp -r .next $BUILD_DIR/
cp -r public $BUILD_DIR/
cp -r prisma $BUILD_DIR/
cp package.json $BUILD_DIR/
cp package-lock.json $BUILD_DIR/
cp next.config.js $BUILD_DIR/
cp -r node_modules $BUILD_DIR/

# 6. Créer le fichier .env sur le VPS
step "Creating .env file..."
cat > $BUILD_DIR/.env.production << 'EOF'
# Ce fichier sera remplacé sur le serveur avec les vraies valeurs
NODE_ENV=production
PORT=3001
EOF

# 7. Créer le script de démarrage PM2
step "Creating PM2 ecosystem file..."
cat > $BUILD_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '${APP_NAME}',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/${APP_NAME}',
    instances: 2,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: ${APP_PORT}
    },
    error_file: '/var/log/pm2/${APP_NAME}-error.log',
    out_file: '/var/log/pm2/${APP_NAME}-out.log',
    log_file: '/var/log/pm2/${APP_NAME}-combined.log',
    time: true
  }]
};
EOF

# 8. Créer l'archive
step "Creating deployment archive..."
cd $BUILD_DIR
tar -czf ../deployment-${ENVIRONMENT}.tar.gz .
cd ..

# 9. Uploader sur le VPS
step "Uploading to VPS..."
scp deployment-${ENVIRONMENT}.tar.gz ${VPS_USER}@${VPS_HOST}:/tmp/ || error "Failed to upload to VPS"

# 10. Exécuter le déploiement sur le VPS
step "Executing deployment on VPS..."
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
    set -e
    
    APP_NAME="afrikipresse"
    APP_DIR="/var/www/${APP_NAME}"
    BACKUP_DIR="/var/backups/${APP_NAME}"
    
    echo "📦 Creating backup of current deployment..."
    if [ -d "$APP_DIR" ]; then
        sudo mkdir -p $BACKUP_DIR
        sudo tar -czf $BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz -C $APP_DIR . 2>/dev/null || true
        
        # Garder seulement les 5 derniers backups
        cd $BACKUP_DIR
        ls -t backup-*.tar.gz | tail -n +6 | xargs -r rm
    fi
    
    echo "📂 Creating application directory..."
    sudo mkdir -p $APP_DIR
    sudo chown -R $USER:$USER $APP_DIR
    
    echo "📤 Extracting deployment package..."
    cd $APP_DIR
    tar -xzf /tmp/deployment-production.tar.gz
    rm /tmp/deployment-production.tar.gz
    
    echo "🔧 Setting up environment..."
    # Créer .env.local avec les vraies valeurs depuis /etc/environment.d/afrikipresse
    if [ -f "/etc/environment.d/afrikipresse" ]; then
        cp /etc/environment.d/afrikipresse .env.local
    else
        echo "⚠️  Warning: /etc/environment.d/afrikipresse not found. Using .env.production"
        cp .env.production .env.local
    fi
    
    echo "🔄 Managing PM2 process..."
    # Installer PM2 si nécessaire
    if ! command -v pm2 &> /dev/null; then
        echo "Installing PM2 globally..."
        sudo npm install -g pm2
    fi
    
    # Recharger ou démarrer l'application
    if pm2 describe $APP_NAME > /dev/null 2>&1; then
        echo "Reloading existing PM2 process..."
        pm2 reload ecosystem.config.js --update-env
    else
        echo "Starting new PM2 process..."
        pm2 start ecosystem.config.js
    fi
    
    # Sauvegarder la configuration PM2
    pm2 save
    
    # Configurer PM2 pour démarrer au boot (si pas déjà fait)
    sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME || true
    
    echo "✅ Deployment completed successfully!"
    pm2 list
ENDSSH

# 11. Health check
step "Performing health check..."
sleep 5
SITE_URL=${SITE_URL:-"http://${VPS_HOST}:${APP_PORT}"}
if curl -f -s -o /dev/null -w "%{http_code}" "$SITE_URL" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    warn "Health check failed. Please verify manually."
fi

# 12. Nettoyer
step "Cleaning up..."
rm -rf $BUILD_DIR
rm deployment-${ENVIRONMENT}.tar.gz

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}Application is running at: ${SITE_URL}${NC}"
echo ""
echo "Useful commands:"
echo "  ssh ${VPS_USER}@${VPS_HOST} 'pm2 logs ${APP_NAME}'"
echo "  ssh ${VPS_USER}@${VPS_HOST} 'pm2 status'"
echo "  ssh ${VPS_USER}@${VPS_HOST} 'pm2 restart ${APP_NAME}'"
