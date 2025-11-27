#!/bin/bash

# Script de configuration Nginx pour sous-domaine actu.afrikipresse.fr
# Usage: sudo bash configure-nginx-subdomain.sh

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOMAIN="actu.afrikipresse.fr"
APP_PORT=3001
APP_NAME="afrikipresse"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"
CONFIG_FILE="${NGINX_AVAILABLE}/${DOMAIN}"

echo -e "${BLUE}🚀 Configuration de ${DOMAIN} pour l'application ${APP_NAME}${NC}"

# Vérifier les permissions root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Ce script doit être exécuté en tant que root${NC}"
    echo "Utilisez: sudo bash $0"
    exit 1
fi

# Vérifier que Nginx est installé
if ! command -v nginx &> /dev/null; then
    echo -e "${RED}❌ Nginx n'est pas installé${NC}"
    exit 1
fi

# Vérifier que PM2 tourne l'application
if ! pm2 describe $APP_NAME &> /dev/null; then
    echo -e "${YELLOW}⚠️  L'application ${APP_NAME} n'est pas en cours d'exécution dans PM2${NC}"
    echo "Voulez-vous continuer quand même ? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Créer la configuration Nginx
echo -e "${GREEN}▶ Création de la configuration Nginx...${NC}"

cat > $CONFIG_FILE << 'EOF'
# Configuration Nginx pour actu.afrikipresse.fr
# Application Next.js sur port 3001

# Upstream configuration
upstream nextjs_actu_afrikipresse {
    server 127.0.0.1:3001;
    keepalive 64;
}

# Configuration du cache
proxy_cache_path /var/cache/nginx/actu_afrikipresse levels=1:2 keys_zone=actu_cache:10m max_size=1g inactive=60m use_temp_path=off;

# Redirection HTTP vers HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name actu.afrikipresse.fr;

    # Gestion Certbot
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirection vers HTTPS (commenté pour le premier déploiement)
    # return 301 https://$server_name$request_uri;
    
    # Temporaire: proxy vers l'application (décommenter pour tester sans SSL)
    location / {
        proxy_pass http://nextjs_actu_afrikipresse;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Configuration HTTPS (à activer après Certbot)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name actu.afrikipresse.fr;

    # Certificats SSL (générés par Certbot)
    ssl_certificate /etc/letsencrypt/live/actu.afrikipresse.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/actu.afrikipresse.fr/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Session SSL (options-ssl-nginx.conf contient déjà protocols et ciphers)
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Taille maximum des uploads
    client_max_body_size 50M;

    # Timeouts
    proxy_connect_timeout 600s;
    proxy_send_timeout 600s;
    proxy_read_timeout 600s;
    send_timeout 600s;

    # Logs
    access_log /var/log/nginx/actu-afrikipresse-access.log;
    error_log /var/log/nginx/actu-afrikipresse-error.log;

    # Cache des fichiers statiques Next.js (_next/static)
    location /_next/static {
        proxy_pass http://nextjs_actu_afrikipresse;
        proxy_cache actu_cache;
        proxy_cache_valid 200 365d;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        proxy_cache_revalidate on;
        proxy_cache_lock on;
        add_header X-Cache-Status $upstream_cache_status;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Images et assets statiques
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://nextjs_actu_afrikipresse;
        proxy_cache actu_cache;
        proxy_cache_valid 200 30d;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        add_header X-Cache-Status $upstream_cache_status;
    }

    # API routes (pas de cache)
    location /api {
        proxy_pass http://nextjs_actu_afrikipresse;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_no_cache 1;
    }

    # Pages dynamiques
    location / {
        proxy_pass http://nextjs_actu_afrikipresse;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Buffers
        proxy_buffering on;
        proxy_buffers 12 12k;
        proxy_buffer_size 12k;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
}
EOF

echo -e "${GREEN}✅ Configuration Nginx créée${NC}"

# Créer le dossier de cache
echo -e "${GREEN}▶ Création du dossier de cache...${NC}"
mkdir -p /var/cache/nginx/actu_afrikipresse
chown -R www-data:www-data /var/cache/nginx/actu_afrikipresse

# Créer le dossier pour Certbot
mkdir -p /var/www/certbot

# Activer la configuration
echo -e "${GREEN}▶ Activation de la configuration...${NC}"
ln -sf $CONFIG_FILE $NGINX_ENABLED/$DOMAIN

# Tester la configuration Nginx
echo -e "${GREEN}▶ Test de la configuration Nginx...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Configuration Nginx valide${NC}"
else
    echo -e "${RED}❌ Erreur dans la configuration Nginx${NC}"
    exit 1
fi

# Recharger Nginx
echo -e "${GREEN}▶ Rechargement de Nginx...${NC}"
systemctl reload nginx

echo ""
echo -e "${GREEN}🎉 Configuration terminée avec succès !${NC}"
echo ""
echo -e "${YELLOW}📋 Prochaines étapes :${NC}"
echo ""
echo -e "${BLUE}1. Configurer le DNS :${NC}"
echo "   Ajoutez un enregistrement A pour actu.afrikipresse.fr pointant vers votre IP VPS"
echo "   IP du VPS : $(curl -s ifconfig.me)"
echo ""
echo -e "${BLUE}2. Tester l'application (HTTP) :${NC}"
echo "   curl http://actu.afrikipresse.fr"
echo "   ou visitez: http://actu.afrikipresse.fr"
echo ""
echo -e "${BLUE}3. Configurer SSL avec Certbot :${NC}"
echo "   sudo certbot --nginx -d actu.afrikipresse.fr"
echo ""
echo -e "${BLUE}4. Activer HTTPS automatiquement :${NC}"
echo "   Après Certbot, décommentez la ligne 'return 301' dans le bloc HTTP"
echo "   sudo nano $CONFIG_FILE"
echo "   sudo systemctl reload nginx"
echo ""
echo -e "${BLUE}5. Vérifier les logs :${NC}"
echo "   sudo tail -f /var/log/nginx/actu-afrikipresse-access.log"
echo "   sudo tail -f /var/log/nginx/actu-afrikipresse-error.log"
echo "   pm2 logs afrikipresse"
echo ""
echo -e "${GREEN}✅ L'application sera accessible sur :${NC}"
echo "   HTTP:  http://actu.afrikipresse.fr"
echo "   HTTPS: https://actu.afrikipresse.fr (après SSL)"
