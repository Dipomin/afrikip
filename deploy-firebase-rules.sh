#!/bin/bash

# 🔥 Script de déploiement des règles Firebase
# Ce script déploie les règles Firestore et Storage sur Firebase

set -e  # Arrêter en cas d'erreur

echo "🔥 Déploiement des règles Firebase..."
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Vérifier que Firebase CLI est installé
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI n'est pas installé${NC}"
    echo -e "${YELLOW}📦 Installation...${NC}"
    npm install -g firebase-tools
fi

echo -e "${GREEN}✅ Firebase CLI trouvé${NC}"
echo ""

# 2. Vérifier la connexion Firebase
echo -e "${BLUE}🔐 Vérification de la connexion Firebase...${NC}"
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Non connecté à Firebase${NC}"
    echo -e "${BLUE}🔑 Connexion en cours...${NC}"
    firebase login
fi

echo -e "${GREEN}✅ Connecté à Firebase${NC}"
echo ""

# 3. Lister les projets disponibles
echo -e "${BLUE}📋 Projets Firebase disponibles:${NC}"
firebase projects:list
echo ""

# 4. Demander quel projet utiliser (ou utiliser celui par défaut)
echo -e "${YELLOW}🎯 Quel projet utiliser?${NC}"
read -p "ID du projet (ou Enter pour utiliser le projet par défaut): " PROJECT_ID

if [ -n "$PROJECT_ID" ]; then
    echo -e "${BLUE}📌 Utilisation du projet: $PROJECT_ID${NC}"
    firebase use "$PROJECT_ID"
else
    echo -e "${BLUE}📌 Utilisation du projet par défaut${NC}"
fi

echo ""

# 5. Afficher les fichiers qui seront déployés
echo -e "${BLUE}📄 Fichiers de règles à déployer:${NC}"
echo "  - firestore.rules ($(wc -l < firestore.rules) lignes)"
echo "  - storage.rules ($(wc -l < storage.rules) lignes)"
echo "  - firestore.indexes.json"
echo ""

# 6. Confirmation
read -p "🚀 Déployer les règles maintenant? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Déploiement annulé${NC}"
    exit 1
fi

# 7. Déploiement
echo ""
echo -e "${BLUE}🚀 Déploiement en cours...${NC}"
firebase deploy --only firestore:rules,storage:rules,firestore:indexes

# 8. Vérification
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Règles déployées avec succès !${NC}"
    echo ""
    echo -e "${GREEN}🎉 Vous pouvez maintenant:${NC}"
    echo "  1. Recharger http://localhost:3000/lintelligentpdf/aujourdhui"
    echo "  2. Vérifier que les journaux s'affichent"
    echo "  3. Tester l'upload sur /lintelligentpdf/upload"
    echo ""
    echo -e "${BLUE}📊 Pour vérifier les règles:${NC}"
    echo "  - Console: https://console.firebase.google.com"
    echo "  - Firestore Database → Rules"
    echo "  - Storage → Rules"
else
    echo ""
    echo -e "${RED}❌ Erreur lors du déploiement${NC}"
    echo -e "${YELLOW}💡 Solutions:${NC}"
    echo "  1. Vérifier votre connexion Internet"
    echo "  2. Vérifier les permissions du projet Firebase"
    echo "  3. Réessayer avec: firebase login --reauth"
    exit 1
fi
