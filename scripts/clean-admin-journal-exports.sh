#!/bin/bash

# Script pour nettoyer les exports dupliqués et corriger la structure

set -e

echo "🧹 Nettoyage des exports 'dynamic' dupliqués..."

# Liste des répertoires
YEARS=("2009" "2010" "2011" "2012" "2013" "2017" "2018" "2019" "2020" "2021" "2022" "2023" "2024" "jour")

for year in "${YEARS[@]}"; do
    for file in "index.tsx" "TableWrapperUser.tsx"; do
        FILE_PATH="pages/admin/journal/pdf/$year/$file"
        
        if [ -f "$FILE_PATH" ]; then
            # Créer un fichier temporaire
            TMP_FILE=$(mktemp)
            
            # Lire le fichier et reconstruire proprement
            {
                # Extraire tous les imports (lignes commençant par import)
                grep "^import " "$FILE_PATH" | sort -u
                
                # Ajouter une ligne vide
                echo ""
                
                # Ajouter l'export dynamic une seule fois
                echo "// Force dynamic rendering - Firebase data cannot be prerendered"
                echo 'export const dynamic = "force-dynamic";'
                echo ""
                
                # Extraire le reste du code (tout sauf imports et dynamic)
                grep -v "^import " "$FILE_PATH" | \
                grep -v "^// Force dynamic rendering" | \
                grep -v '^export const dynamic' | \
                sed '/^$/N;/^\n$/d'  # Supprimer lignes vides multiples
                
            } > "$TMP_FILE"
            
            # Remplacer le fichier original
            mv "$TMP_FILE" "$FILE_PATH"
            echo "✅ Nettoyé: $FILE_PATH"
        fi
    done
done

# Nettoyer aussi le fichier index principal
MAIN_INDEX="pages/admin/journal/index.tsx"
if [ -f "$MAIN_INDEX" ]; then
    TMP_FILE=$(mktemp)
    {
        grep "^import " "$MAIN_INDEX" | sort -u
        echo ""
        echo "// Force dynamic rendering - Firebase data cannot be prerendered"
        echo 'export const dynamic = "force-dynamic";'
        echo ""
        grep -v "^import " "$MAIN_INDEX" | \
        grep -v "^// Force dynamic rendering" | \
        grep -v '^export const dynamic' | \
        sed '/^$/N;/^\n$/d'
    } > "$TMP_FILE"
    mv "$TMP_FILE" "$MAIN_INDEX"
    echo "✅ Nettoyé: $MAIN_INDEX"
fi

echo ""
echo "🎉 Nettoyage terminé!"
