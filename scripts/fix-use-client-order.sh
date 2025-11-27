#!/bin/bash

# Script pour corriger l'ordre: "use client" doit être AVANT export const dynamic

set -e

echo "🔧 Correction de l'ordre 'use client' et 'export const dynamic'..."

YEARS=("2009" "2010" "2011" "2012" "2013" "2017" "2018" "2019" "2020" "2021" "2022" "2023" "2024" "jour")

for year in "${YEARS[@]}"; do
    FILE="pages/admin/journal/pdf/$year/TableWrapperUser.tsx"
    
    if [ -f "$FILE" ]; then
        # Vérifier si le fichier contient "use client" et "export const dynamic"
        if grep -q '"use client"' "$FILE" && grep -q 'export const dynamic' "$FILE"; then
            # Créer un fichier temporaire
            TMP_FILE=$(mktemp)
            
            # Extraire les imports
            grep "^import " "$FILE" > "$TMP_FILE"
            
            # Ajouter une ligne vide
            echo "" >> "$TMP_FILE"
            
            # Ajouter "use client" EN PREMIER
            echo '"use client";' >> "$TMP_FILE"
            echo "" >> "$TMP_FILE"
            
            # Ajouter export const dynamic APRÈS
            echo "// Force dynamic rendering - Firebase data cannot be prerendered" >> "$TMP_FILE"
            echo 'export const dynamic = "force-dynamic";' >> "$TMP_FILE"
            echo "" >> "$TMP_FILE"
            
            # Ajouter le reste du code (sans imports, use client, et dynamic)
            grep -v "^import " "$FILE" | \
            grep -v '"use client"' | \
            grep -v "^// Force dynamic rendering" | \
            grep -v '^export const dynamic' | \
            sed '/^$/N;/^\n$/d' >> "$TMP_FILE"
            
            # Remplacer le fichier
            mv "$TMP_FILE" "$FILE"
            echo "✅ Corrigé: $FILE"
        else
            echo "⏭️  Pas de use client dans: $FILE"
        fi
    fi
done

echo ""
echo "🎉 Correction terminée!"
