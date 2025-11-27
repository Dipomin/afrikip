#!/bin/bash

# Script pour désactiver le prerendering des pages admin journal
# Ces pages nécessitent Firebase et ne peuvent pas être générées au build time

set -e

echo "🔧 Ajout de 'export const dynamic = force-dynamic' aux pages admin journal..."

# Liste des répertoires à corriger
YEARS=("2009" "2010" "2011" "2012" "2013" "2017" "2018" "2019" "2020" "2021" "2022" "2023" "2024" "jour")

for year in "${YEARS[@]}"; do
    INDEX_FILE="pages/admin/journal/pdf/$year/index.tsx"
    WRAPPER_FILE="pages/admin/journal/pdf/$year/TableWrapperUser.tsx"
    
    # Corriger index.tsx
    if [ -f "$INDEX_FILE" ]; then
        # Vérifier si la ligne n'existe pas déjà
        if ! grep -q "export const dynamic" "$INDEX_FILE"; then
            # Ajouter après les imports
            sed -i '' '/^import/a\
\
// Force dynamic rendering - Firebase data cannot be prerendered\
export const dynamic = "force-dynamic";\
' "$INDEX_FILE"
            echo "✅ Corrigé: $INDEX_FILE"
        else
            echo "⏭️  Déjà corrigé: $INDEX_FILE"
        fi
    fi
    
    # Corriger TableWrapperUser.tsx
    if [ -f "$WRAPPER_FILE" ]; then
        if ! grep -q "export const dynamic" "$WRAPPER_FILE"; then
            sed -i '' '/^import/a\
\
// Force dynamic rendering - Firebase data cannot be prerendered\
export const dynamic = "force-dynamic";\
' "$WRAPPER_FILE"
            echo "✅ Corrigé: $WRAPPER_FILE"
        else
            echo "⏭️  Déjà corrigé: $WRAPPER_FILE"
        fi
    fi
done

# Corriger aussi le fichier index.tsx principal
MAIN_INDEX="pages/admin/journal/index.tsx"
if [ -f "$MAIN_INDEX" ]; then
    if ! grep -q "export const dynamic" "$MAIN_INDEX"; then
        sed -i '' '/^import/a\
\
// Force dynamic rendering - Firebase data cannot be prerendered\
export const dynamic = "force-dynamic";\
' "$MAIN_INDEX"
        echo "✅ Corrigé: $MAIN_INDEX"
    else
        echo "⏭️  Déjà corrigé: $MAIN_INDEX"
    fi
fi

echo ""
echo "🎉 Correction terminée!"
echo "Testez le build avec: npm run build"
