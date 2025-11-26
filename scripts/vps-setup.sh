#!/bin/bash

# Script de configuration initiale du VPS pour héberger plusieurs applications Next.js
# À exécuter une seule fois lors de la première configuration du serveur

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 VPS Initial Setup for Multiple Next.js Apps${NC}"
echo "This script will configure your VPS to host multiple Next.js applications"
echo ""

# Vérifier si on est root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

step() {
    echo -e "${GREEN}▶ $1${NC}"
}

# 1. Mettre à jour le système
step "Updating system packages..."
apt update && apt upgrade -y

# 2. Installer les dépendances essentielles
step "Installing essential packages..."
apt install -y curl wget git build-essential software-properties-common

# 3. Installer Node.js (v18 LTS)
step "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Vérifier l'installation
node --version
npm --version

# 4. Installer PM2 globalement
step "Installing PM2 process manager..."
npm install -g pm2

# 5. Installer Nginx
step "Installing Nginx..."
apt install -y nginx

# 6. Configurer le firewall
step "Configuring UFW firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 7. Créer la structure de répertoires
step "Creating directory structure..."
mkdir -p /var/www
mkdir -p /var/backups
mkdir -p /var/log/pm2
mkdir -p /etc/nginx/sites-available
mkdir -p /etc/nginx/sites-enabled
mkdir -p /etc/environment.d

# 8. Créer un utilisateur de déploiement (si pas déjà existant)
DEPLOY_USER=${DEPLOY_USER:-deploy}
if ! id "$DEPLOY_USER" &>/dev/null; then
    step "Creating deployment user: $DEPLOY_USER..."
    adduser --disabled-password --gecos "" $DEPLOY_USER
    usermod -aG sudo $DEPLOY_USER
    
    # Configurer sudo sans mot de passe pour le déploiement
    echo "$DEPLOY_USER ALL=(ALL) NOPASSWD: /usr/bin/systemctl, /usr/bin/pm2, /bin/chown, /bin/mkdir" > /etc/sudoers.d/$DEPLOY_USER
fi

# 9. Donner les permissions appropriées
chown -R $DEPLOY_USER:$DEPLOY_USER /var/www
chown -R $DEPLOY_USER:$DEPLOY_USER /var/log/pm2
chmod -R 755 /var/www

# 10. Créer la configuration Nginx de base pour reverse proxy
step "Creating Nginx base configuration..."
cat > /etc/nginx/conf.d/proxy.conf << 'EOF'
# Configuration globale pour le reverse proxy
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m use_temp_path=off;

# Augmenter les timeouts
proxy_connect_timeout 600s;
proxy_send_timeout 600s;
proxy_read_timeout 600s;
fastcgi_send_timeout 600s;
fastcgi_read_timeout 600s;

# Buffers
proxy_buffer_size 128k;
proxy_buffers 4 256k;
proxy_busy_buffers_size 256k;

# Headers de sécurité
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
EOF

# 11. Créer un template de configuration Nginx pour les apps Next.js
step "Creating Nginx template for Next.js apps..."
cat > /etc/nginx/templates/nextjs-app.template << 'EOF'
# Configuration Nginx pour APP_NAME
# Port: APP_PORT
# Domain: APP_DOMAIN

upstream APP_NAME_upstream {
    server 127.0.0.1:APP_PORT;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name APP_DOMAIN www.APP_DOMAIN;

    # Logs
    access_log /var/log/nginx/APP_NAME-access.log;
    error_log /var/log/nginx/APP_NAME-error.log;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # Static files cache
    location /_next/static/ {
        alias /var/www/APP_NAME/.next/static/;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    location /public/ {
        alias /var/www/APP_NAME/public/;
        expires 30d;
        access_log off;
        add_header Cache-Control "public";
    }

    # Main proxy pass
    location / {
        proxy_pass http://APP_NAME_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
    }
}
EOF

# 12. Installer Certbot pour SSL (Let's Encrypt)
step "Installing Certbot for SSL..."
apt install -y certbot python3-certbot-nginx

# 13. Créer un script helper pour ajouter de nouvelles applications
step "Creating helper script for adding new apps..."
cat > /usr/local/bin/add-nextjs-app << 'EOFSCRIPT'
#!/bin/bash

# Script pour ajouter une nouvelle application Next.js

set -e

if [ "$#" -lt 3 ]; then
    echo "Usage: add-nextjs-app <app-name> <domain> <port>"
    echo "Example: add-nextjs-app myapp example.com 3000"
    exit 1
fi

APP_NAME=$1
APP_DOMAIN=$2
APP_PORT=$3

echo "Adding new Next.js application..."
echo "  Name: $APP_NAME"
echo "  Domain: $APP_DOMAIN"
echo "  Port: $APP_PORT"

# Créer le répertoire de l'application
mkdir -p /var/www/$APP_NAME
chown -R deploy:deploy /var/www/$APP_NAME

# Créer la configuration Nginx depuis le template
sed -e "s/APP_NAME/$APP_NAME/g" \
    -e "s/APP_DOMAIN/$APP_DOMAIN/g" \
    -e "s/APP_PORT/$APP_PORT/g" \
    /etc/nginx/templates/nextjs-app.template > /etc/nginx/sites-available/$APP_NAME

# Activer le site
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/$APP_NAME

# Tester la configuration Nginx
nginx -t

# Recharger Nginx
systemctl reload nginx

# Créer le fichier d'environnement
touch /etc/environment.d/$APP_NAME
chown deploy:deploy /etc/environment.d/$APP_NAME
chmod 600 /etc/environment.d/$APP_NAME

echo "✅ Application $APP_NAME configured successfully!"
echo ""
echo "Next steps:"
echo "1. Edit environment variables: sudo nano /etc/environment.d/$APP_NAME"
echo "2. Deploy your application to /var/www/$APP_NAME"
echo "3. Setup SSL: sudo certbot --nginx -d $APP_DOMAIN -d www.$APP_DOMAIN"
echo "4. Start PM2 process: pm2 start ecosystem.config.js"

EOFSCRIPT

chmod +x /usr/local/bin/add-nextjs-app

# 14. Configurer PM2 pour démarrer au boot
step "Configuring PM2 startup..."
su - $DEPLOY_USER -c "pm2 startup systemd -u $DEPLOY_USER --hp /home/$DEPLOY_USER" | grep "sudo" | bash || true

# 15. Optimiser le système pour Node.js
step "Optimizing system for Node.js..."
cat >> /etc/sysctl.conf << 'EOF'

# Optimisations pour Node.js
fs.file-max = 65536
net.core.somaxconn = 65536
net.ipv4.tcp_max_syn_backlog = 8192
EOF

sysctl -p

# 16. Créer un script de monitoring
cat > /usr/local/bin/monitor-apps << 'EOFMONITOR'
#!/bin/bash
echo "=== PM2 Process Status ==="
pm2 list
echo ""
echo "=== Nginx Status ==="
systemctl status nginx --no-pager | head -10
echo ""
echo "=== Disk Usage ==="
df -h / | tail -1
echo ""
echo "=== Memory Usage ==="
free -h
echo ""
echo "=== Active Connections ==="
ss -s
EOFMONITOR

chmod +x /usr/local/bin/monitor-apps

# 17. Configurer la rotation des logs
cat > /etc/logrotate.d/nextjs-apps << 'EOF'
/var/log/pm2/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 deploy deploy
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

echo ""
echo -e "${GREEN}✅ VPS Setup Completed Successfully!${NC}"
echo ""
echo "Summary:"
echo "  - Node.js $(node --version) installed"
echo "  - PM2 $(pm2 --version) installed"
echo "  - Nginx installed and configured"
echo "  - Deployment user: $DEPLOY_USER"
echo "  - Firewall configured (ports 22, 80, 443)"
echo ""
echo "To add a new Next.js app, run:"
echo "  sudo add-nextjs-app <app-name> <domain> <port>"
echo ""
echo "Example:"
echo "  sudo add-nextjs-app afrikipresse afrikipresse.fr 3001"
echo ""
echo "Monitor your apps:"
echo "  monitor-apps"
