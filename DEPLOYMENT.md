# Guide de Déploiement VPS - Afrikipresse

Ce guide explique comment déployer l'application Afrikipresse sur un VPS hébergeant déjà d'autres applications Next.js.

## 📋 Prérequis

- Un VPS Ubuntu 20.04+ ou Debian 11+
- Accès root ou sudo
- Node.js 18.x
- PM2 pour la gestion des processus
- Nginx comme reverse proxy
- Domaine configuré pointant vers votre VPS

## 🚀 Configuration Initiale du VPS (À faire une seule fois)

### 1. Exécuter le script de setup initial

```bash
# Sur votre machine locale, copier le script sur le VPS
scp scripts/vps-setup.sh root@your-vps-ip:/tmp/

# Se connecter au VPS
ssh root@your-vps-ip

# Exécuter le script de setup
chmod +x /tmp/vps-setup.sh
sudo /tmp/vps-setup.sh
```

Ce script installe et configure :
- Node.js 18 LTS
- PM2 (process manager)
- Nginx (reverse proxy)
- Certbot (SSL gratuit)
- Firewall UFW
- Structure de dossiers
- Utilisateur de déploiement
- Scripts helper

### 2. Ajouter l'application Afrikipresse

```bash
sudo add-nextjs-app afrikipresse afrikipresse.fr 3001
```

Remplacez `afrikipresse.fr` par votre domaine et `3001` par le port souhaité.

### 3. Configurer les variables d'environnement

```bash
sudo nano /etc/environment.d/afrikipresse
```

Ajouter toutes les variables d'environnement :

```env
# WordPress
WORDPRESS_API_URL=https://adm.afrikipresse.fr/graphql
WORDPRESS_AUTH_REFRESH_TOKEN=your_token

# Database
DATABASE_URL=mysql://user:password@localhost:3306/afrikipresse

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# CinetPay
CINETPAY_KEY=your_key
CINETPAY_SITE_ID=your_site_id

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# App Config
NEXT_PUBLIC_SITE_URL=https://afrikipresse.fr
NODE_ENV=production
PORT=3001
```

### 4. Configurer SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d afrikipresse.fr -d www.afrikipresse.fr
```

## 🔄 Déploiement

### Option 1 : Déploiement Automatique via GitHub Actions (Recommandé)

#### Configuration des Secrets GitHub

Allez dans `Settings > Secrets and variables > Actions` de votre repo et ajoutez :

**Secrets VPS :**
- `VPS_HOST` : IP ou domaine du VPS
- `VPS_USERNAME` : Nom d'utilisateur (ex: deploy)
- `VPS_SSH_KEY` : Clé SSH privée pour l'accès
- `VPS_SSH_PORT` : Port SSH (optionnel, défaut: 22)

**Secrets Application :**
Tous les secrets listés dans la section "Variables d'environnement" ci-dessus :
- `WORDPRESS_API_URL`
- `DATABASE_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- etc.

#### Générer une clé SSH pour GitHub Actions

Sur le VPS :
```bash
# Créer une clé SSH dédiée
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_key

# Ajouter la clé publique aux clés autorisées
cat ~/.ssh/github_actions_key.pub >> ~/.ssh/authorized_keys

# Afficher la clé privée (à copier dans GitHub Secrets)
cat ~/.ssh/github_actions_key
```

#### Déclencher le déploiement

Le déploiement se déclenche automatiquement à chaque push sur `main` ou `production`.

Vous pouvez aussi le déclencher manuellement :
```bash
# Dans GitHub : Actions > Deploy to VPS > Run workflow
```

### Option 2 : Déploiement Manuel

#### Sur votre machine locale

```bash
# Exporter les variables VPS
export VPS_HOST=your-vps-ip
export VPS_USER=deploy
export SITE_URL=https://afrikipresse.fr

# Rendre le script exécutable
chmod +x scripts/deploy-to-vps.sh

# Lancer le déploiement
./scripts/deploy-to-vps.sh production
```

Le script effectue automatiquement :
1. ✅ Build de l'application
2. ✅ Création de l'archive de déploiement
3. ✅ Upload vers le VPS
4. ✅ Backup de l'ancienne version
5. ✅ Extraction des fichiers
6. ✅ Restart PM2
7. ✅ Health check

### Option 3 : Déploiement via PM2 Deploy

```bash
# Configuration initiale
pm2 deploy ecosystem.config.js production setup

# Déployer
pm2 deploy ecosystem.config.js production
```

## 📊 Monitoring et Gestion

### Commandes PM2 essentielles

```bash
# Se connecter au VPS
ssh deploy@your-vps-ip

# Voir le statut des applications
pm2 status

# Logs en temps réel
pm2 logs afrikipresse

# Logs des dernières erreurs
pm2 logs afrikipresse --err --lines 100

# Redémarrer l'application
pm2 restart afrikipresse

# Recharger sans downtime
pm2 reload afrikipresse

# Arrêter l'application
pm2 stop afrikipresse

# Supprimer l'application
pm2 delete afrikipresse

# Monitoring du CPU/RAM
pm2 monit

# Sauvegarder la liste PM2
pm2 save
```

### Script de monitoring global

```bash
# Sur le VPS
monitor-apps
```

Affiche :
- Statut de tous les processus PM2
- Statut Nginx
- Utilisation disque
- Utilisation mémoire
- Connexions actives

### Logs Nginx

```bash
# Logs d'accès
tail -f /var/log/nginx/afrikipresse-access.log

# Logs d'erreur
tail -f /var/log/nginx/afrikipresse-error.log
```

## 🔧 Maintenance

### Mettre à jour Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt update && sudo apt upgrade -y
```

### Nettoyer les vieux backups

```bash
# Garder seulement les 5 derniers
cd /var/backups/afrikipresse
ls -t backup-*.tar.gz | tail -n +6 | xargs rm
```

### Renouveler le certificat SSL

```bash
# Automatique via cron, mais pour forcer :
sudo certbot renew --force-renewal
```

### Rotation des logs PM2

Les logs sont automatiquement rotés tous les jours (14 jours d'historique).

Pour forcer une rotation :
```bash
pm2 flush
```

## 🚨 Dépannage

### L'application ne démarre pas

```bash
# Vérifier les logs PM2
pm2 logs afrikipresse --lines 200

# Vérifier si le port est utilisé
sudo lsof -i :3001

# Tester le build localement
cd /var/www/afrikipresse
npm run build
```

### Problèmes de mémoire

```bash
# Augmenter la limite dans ecosystem.config.js
max_memory_restart: '2G'

# Puis recharger
pm2 reload afrikipresse
```

### Nginx 502 Bad Gateway

```bash
# Vérifier que l'app PM2 tourne
pm2 status

# Vérifier les logs Nginx
tail -f /var/log/nginx/afrikipresse-error.log

# Tester la config Nginx
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

### Prisma ne génère pas les types

```bash
cd /var/www/afrikipresse
npx prisma generate
pm2 restart afrikipresse
```

## 📦 Architecture Multi-Apps

Le VPS est configuré pour héberger plusieurs applications Next.js simultanément :

```
VPS
├── afrikipresse (port 3001) → afrikipresse.fr
├── autre-app (port 3002) → autre-app.com
└── troisieme-app (port 3003) → troisieme-app.com
```

### Ajouter une nouvelle application

```bash
sudo add-nextjs-app nom-app domaine.com 3003
```

### Nginx Reverse Proxy

Nginx redirige automatiquement :
- `afrikipresse.fr` → `localhost:3001`
- `autre-app.com` → `localhost:3002`
- etc.

## 🔐 Sécurité

### Mise à jour régulière

```bash
# Sur le VPS
sudo apt update && sudo apt upgrade -y
```

### Firewall

```bash
# Vérifier le statut
sudo ufw status

# Autoriser un nouveau port
sudo ufw allow 3004/tcp
```

### Backup automatique

Les backups sont créés automatiquement avant chaque déploiement dans :
```
/var/backups/afrikipresse/
```

Pour restaurer un backup :
```bash
cd /var/www/afrikipresse
sudo tar -xzf /var/backups/afrikipresse/backup-YYYYMMDD-HHMMSS.tar.gz
pm2 restart afrikipresse
```

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs : `pm2 logs afrikipresse`
2. Vérifier Nginx : `sudo nginx -t`
3. Vérifier les variables d'env : `cat /etc/environment.d/afrikipresse`
4. Health check : `curl http://localhost:3001`

## 🎯 Checklist de Déploiement

- [ ] VPS configuré avec `vps-setup.sh`
- [ ] Application ajoutée avec `add-nextjs-app`
- [ ] Variables d'environnement configurées
- [ ] SSL configuré avec Certbot
- [ ] Secrets GitHub configurés
- [ ] Premier déploiement réussi
- [ ] Health check OK
- [ ] Logs vérifiés
- [ ] Monitoring configuré
- [ ] Backups testés
