#!/bin/bash

# 🔥 Déploiement Storage Rules via Console Firebase
# Ce script ouvre la console Firebase et copie les règles dans le presse-papier

echo "🔥 Déploiement Storage Rules"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Copier les règles dans le presse-papier
echo -e "${BLUE}📋 Copie des règles Storage dans le presse-papier...${NC}"
cat storage.rules | pbcopy
echo -e "${GREEN}✅ Règles copiées !${NC}"
echo ""

# 2. Ouvrir la console Firebase
echo -e "${BLUE}🌐 Ouverture de la console Firebase Storage...${NC}"
open "https://console.firebase.google.com/project/lia-pdf/storage/rules"
echo ""

# 3. Instructions
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📝 INSTRUCTIONS (les règles sont déjà copiées):${NC}"
echo ""
echo "1️⃣  Dans la console Firebase qui s'est ouverte:"
echo "   → Allez dans l'onglet 'Rules' (Règles)"
echo ""
echo "2️⃣  Sélectionnez TOUT le contenu actuel (Cmd+A)"
echo ""
echo "3️⃣  Collez les nouvelles règles (Cmd+V)"
echo "   → Les règles sont déjà dans votre presse-papier !"
echo ""
echo "4️⃣  Cliquez sur 'Publier' (Publish) en haut à droite"
echo ""
echo -e "${GREEN}5️⃣  Attendez quelques secondes puis testez:${NC}"
echo "   → http://localhost:3000/lintelligentpdf/aujourdhui"
echo "   → Cliquez sur un journal"
echo "   → Le PDF devrait s'afficher ! 🎉"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}💡 Si vous avez besoin de recopier les règles:${NC}"
echo "   cat storage.rules | pbcopy"
echo ""
