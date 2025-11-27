#!/bin/bash

# 🔧 Configuration CORS pour Firebase Storage
# Ce script configure les règles CORS pour permettre l'accès aux PDFs depuis localhost et production

set -e

echo "🔧 Configuration CORS Firebase Storage"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Vérifier si gcloud est installé
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Google Cloud SDK (gcloud) n'est pas installé${NC}"
    echo ""
    echo -e "${YELLOW}📦 Installation...${NC}"
    echo "1. Téléchargez et installez depuis: https://cloud.google.com/sdk/docs/install"
    echo "2. Ou via Homebrew: brew install --cask google-cloud-sdk"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ gcloud CLI trouvé${NC}"
echo ""

# Vérifier la connexion
echo -e "${BLUE}🔐 Vérification de la connexion Google Cloud...${NC}"
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Non connecté à Google Cloud${NC}"
    echo -e "${BLUE}🔑 Connexion en cours...${NC}"
    gcloud auth login
fi

echo -e "${GREEN}✅ Connecté à Google Cloud${NC}"
echo ""

# Définir le projet
PROJECT_ID="lia-pdf"
BUCKET="gs://lia-pdf.appspot.com"

echo -e "${BLUE}📌 Configuration du projet: $PROJECT_ID${NC}"
gcloud config set project $PROJECT_ID

echo ""
echo -e "${BLUE}📄 Fichier CORS à déployer:${NC}"
cat cors.json
echo ""

# Confirmation
read -p "🚀 Appliquer la configuration CORS au bucket Storage? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Opération annulée${NC}"
    exit 1
fi

# Appliquer CORS
echo ""
echo -e "${BLUE}🚀 Application de la configuration CORS...${NC}"
gsutil cors set cors.json $BUCKET

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ CORS configuré avec succès !${NC}"
    echo ""
    echo -e "${GREEN}🎉 Vous pouvez maintenant:${NC}"
    echo "  1. Recharger http://localhost:3000/lintelligentpdf/aujourdhui"
    echo "  2. Cliquer sur un journal"
    echo "  3. Le PDF devrait se charger sans erreur CORS ! 🎉"
    echo ""
    echo -e "${BLUE}📊 Pour vérifier la configuration:${NC}"
    echo "  gsutil cors get $BUCKET"
else
    echo ""
    echo -e "${RED}❌ Erreur lors de l'application CORS${NC}"
    echo -e "${YELLOW}💡 Solutions:${NC}"
    echo "  1. Vérifier les permissions sur le projet Firebase"
    echo "  2. Vérifier que vous êtes propriétaire/éditeur du projet"
    echo "  3. Réessayer: ./fix-cors.sh"
    exit 1
fi
