#!/bin/bash

# Script de déploiement complet sur VPS
# Copie le .env, build l'application et démarre PM2

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Déploiement complet de l'application Afrikipresse${NC}"
echo ""

# Demander les informations de connexion
read -p "Hôte VPS (ex: 62.84.185.117): " VPS_HOST
read -p "Utilisateur VPS (ex: root): " VPS_USER
read -sp "Mot de passe VPS: " VPS_PASSWORD
echo ""

APP_PATH="/var/www/afrikipresse"

# Vérifier que sshpass est installé
if ! command -v sshpass &> /dev/null; then
    echo -e "${YELLOW}⚙️  Installation de sshpass...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install hudochenkov/sshpass/sshpass
    elif command -v apt-get &> /dev/null; then
        sudo apt-get install -y sshpass
    elif command -v yum &> /dev/null; then
        sudo yum install -y sshpass
    fi
fi

echo -e "${GREEN}▶ 1. Vérification de la connexion VPS...${NC}"
if sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "echo 'Connexion OK'"; then
    echo -e "${GREEN}✅ Connexion établie${NC}"
else
    echo -e "${RED}❌ Impossible de se connecter au VPS${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}▶ 2. Copie du fichier .env.production sur le VPS...${NC}"
if [ -f ".env.production" ]; then
    sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no .env.production $VPS_USER@$VPS_HOST:$APP_PATH/.env.production
    echo -e "${GREEN}✅ .env.production copié${NC}"
elif [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env.production non trouvé, copie de .env...${NC}"
    sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no .env $VPS_USER@$VPS_HOST:$APP_PATH/.env.production
    echo -e "${GREEN}✅ .env copié en tant que .env.production${NC}"
else
    echo -e "${RED}❌ Aucun fichier .env trouvé !${NC}"
    echo "Créez un fichier .env.production avec toutes les variables d'environnement"
    exit 1
fi

echo ""
echo -e "${GREEN}▶ 3. Déploiement et build sur le VPS...${NC}"
echo -e "${YELLOW}⏳ Cela peut prendre 3-5 minutes...${NC}"
echo ""

sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST << 'ENDSSH'
set -e

APP_PATH="/var/www/afrikipresse"
cd $APP_PATH

echo "📦 Mise à jour du code depuis GitHub..."
git pull origin main

echo "🗑️  Arrêt des instances PM2 existantes..."
pm2 delete afrikipresse 2>/dev/null || true

echo "📥 Installation des dépendances..."
npm ci --legacy-peer-deps

echo "🔧 Génération du client Prisma..."
npx prisma generate

echo "🏗️  Build de l'application Next.js..."
NODE_ENV=production npm run build

echo "✅ Build terminé, vérification..."
if [ -f ".next/prerender-manifest.json" ]; then
    echo "✅ .next/prerender-manifest.json existe"
    ls -lh .next/prerender-manifest.json
else
    echo "❌ Erreur: .next/prerender-manifest.json n'existe pas"
    echo "Contenu du dossier .next:"
    ls -la .next/ || echo ".next n'existe pas du tout!"
    exit 1
fi

echo "🚀 Démarrage de PM2..."
pm2 start ecosystem.config.js
pm2 save

echo "📊 Statut PM2:"
sleep 3
pm2 status

echo "📝 Logs récents:"
pm2 logs afrikipresse --lines 10 --nostream

ENDSSH

echo ""
echo -e "${GREEN}🎉 Déploiement terminé !${NC}"
echo ""
echo -e "${BLUE}📋 Vérifications finales :${NC}"
echo "1. Vérifier PM2: ssh $VPS_USER@$VPS_HOST 'pm2 status'"
echo "2. Voir les logs: ssh $VPS_USER@$VPS_HOST 'pm2 logs afrikipresse'"
echo "3. Tester l'app: curl http://$VPS_HOST:3001"
echo "4. Accéder via: http://actu.afrikipresse.fr"
