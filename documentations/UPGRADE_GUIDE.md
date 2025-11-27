# Guide de mise à jour - Résolution des erreurs de build

## Problème principal : Version Node.js

### Erreur actuelle
```
You are using Node.js 16.15.0. For Next.js, Node.js version >= v18.17.0 is required.
```

### Solution recommandée

#### Option 1 : Mise à jour avec nvm (recommandé)
```bash
# Installer nvm si pas déjà fait
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Redémarrer le terminal ou sourcer le profil
source ~/.bashrc  # ou ~/.zshrc selon votre shell

# Installer et utiliser Node.js 18 LTS
nvm install 18
nvm use 18
nvm alias default 18

# Vérifier la version
node --version  # Devrait afficher v18.x.x
```

#### Option 2 : Mise à jour directe
```bash
# Sur macOS avec Homebrew
brew uninstall node
brew install node@18

# Sur Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérifier la version
node --version
```

## Corrections apportées

### 1. Suppression du plugin @tailwindcss/line-clamp déprécié

**Problème :** 
```
Error: Cannot find module '@tailwindcss/line-clamp'
```

**Solution appliquée :**
- ✅ Supprimé `@tailwindcss/line-clamp` du `tailwind.config.js`
- ✅ Désinstallé le package avec `npm uninstall @tailwindcss/line-clamp`
- ✅ Créé un fichier CSS personnalisé `styles/line-clamp.css` avec les utilitaires
- ✅ Importé le fichier dans `styles/index.css`

### 2. Classes line-clamp natives

**Tailwind CSS v3.3+** inclut nativement les classes `line-clamp-{n}` :
- `line-clamp-1` à `line-clamp-6`
- `line-clamp-none`

**Fallback CSS créé :**
```css
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

### 3. Composant SimilarArticles optimisé

**Améliorations :**
- ✅ Utilisation des classes `line-clamp` natives
- ✅ Fallback CSS pour compatibilité
- ✅ Suppression des styles inline
- ✅ Code plus propre et maintenable

## Étapes de vérification après mise à jour

### 1. Vérifier les versions
```bash
node --version    # >= v18.17.0
npm --version     # >= 9.x.x
```

### 2. Réinstaller les dépendances
```bash
# Supprimer node_modules et package-lock.json
rm -rf node_modules package-lock.json

# Réinstaller
npm install
```

### 3. Tester le build
```bash
# Mode développement
npm run dev

# Build de production
npm run build
```

### 4. Vérifier les fonctionnalités
- ✅ Composant SimilarArticles s'affiche correctement
- ✅ Classes line-clamp fonctionnent
- ✅ Pas d'erreurs de console
- ✅ Design responsive intact

## Fonctionnalités du composant SimilarArticles

### Algorithme de similarité
- Analyse des catégories communes
- Score basé sur les mots-clés du titre
- Tri par pertinence décroissante

### Design moderne
- Grille responsive (1/2/3 colonnes)
- Animations et effets hover
- Badge "Tendance" pour le premier article
- Images optimisées avec Next.js Image

### Performance
- Chargement lazy des images
- Skeleton UI pendant le loading
- Calculs optimisés côté client

### SEO et accessibilité
- Structure sémantique HTML
- Liens internes optimisés
- Support navigation clavier
- Métadonnées riches

## Dépannage

### Si les classes line-clamp ne fonctionnent pas
1. Vérifier que `styles/line-clamp.css` est importé
2. Purger le cache Tailwind : `npm run build`
3. Vérifier la console pour les erreurs CSS

### Si le composant ne s'affiche pas
1. Vérifier les props passées au composant
2. Vérifier la console pour les erreurs JavaScript
3. S'assurer que `relatedPosts` contient des données

### Performance lente
1. Vérifier la taille des images
2. Optimiser les données `relatedPosts`
3. Utiliser React DevTools pour profiler

## Support

Le composant SimilarArticles est maintenant entièrement compatible avec :
- ✅ Tailwind CSS v3.3+
- ✅ Next.js 14.x (avec Node.js 18+)
- ✅ React 18+
- ✅ TypeScript 5+

Pour toute question ou problème, vérifier d'abord que Node.js >= v18.17.0 est installé.
