#!/bin/bash

# Script pour mettre "use client" EN PREMIÈRE LIGNE (avant même les imports)
# React exige que "use client" soit la toute première directive

echo "🔧 Correction: 'use client' EN PREMIÈRE LIGNE..."

# Liste des fichiers TableWrapperUser.tsx
FILES=(
  "pages/admin/journal/pdf/2009/TableWrapperUser.tsx"
  "pages/admin/journal/pdf/2010/TableWrapperUser.tsx"
  "pages/admin/journal/pdf/2011/TableWrapperUser.tsx"
  "pages/admin/journal/pdf/2012/TableWrapperUser.tsx"
  "pages/admin/journal/pdf/2013/TableWrapperUser.tsx"
  "pages/admin/journal/pdf/2017/TableWrapperUser.tsx"
  "pages/admin/journal/pdf/2018/TableWrapperUser.tsx"
  "pages/admin/journal/pdf/2019/TableWrapperUser.tsx"
  "pages/admin/journal/pdf/2020/TableWrapperUser.tsx"
  "pages/admin/journal/pdf/2021/TableWrapperUser.tsx"
  "pages/admin/journal/pdf/2022/TableWrapperUser.tsx"
  "pages/admin/journal/pdf/2023/TableWrapperUser.tsx"
  "pages/admin/journal/pdf/2024/TableWrapperUser.tsx"
  "pages/admin/journal/pdf/jour/TableWrapperUser.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Créer un fichier temporaire
    temp_file="${file}.tmp"
    
    # PREMIÈRE LIGNE: "use client"
    echo '"use client";' > "$temp_file"
    echo "" >> "$temp_file"
    
    # Ajouter les imports
    grep "^import" "$file" >> "$temp_file"
    echo "" >> "$temp_file"
    
    # Ajouter export const dynamic
    echo "// Force dynamic rendering - Firebase data cannot be prerendered" >> "$temp_file"
    echo 'export const dynamic = "force-dynamic";' >> "$temp_file"
    echo "" >> "$temp_file"
    
    # Ajouter le reste du code (sans imports, use client, et export dynamic)
    grep -v "^import" "$file" | \
    grep -v '"use client"' | \
    grep -v 'export const dynamic' | \
    grep -v "^// Force dynamic rendering" | \
    sed '/^$/N;/^\n$/d' >> "$temp_file"
    
    # Remplacer le fichier original
    mv "$temp_file" "$file"
    
    echo "✅ Corrigé: $file"
  fi
done

echo "🎉 'use client' maintenant EN PREMIÈRE LIGNE dans tous les fichiers!"
