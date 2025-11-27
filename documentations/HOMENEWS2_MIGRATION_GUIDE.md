# Guide de Migration - HomeNews2 v2.0

## Vue d'ensemble

Le composant `HomeNews2` a été entièrement refactorisé pour offrir un design moderne, des fonctionnalités avancées et une meilleure expérience utilisateur. Ce guide vous aidera à migrer vers la nouvelle version.

## 🔄 Rétrocompatibilité

**Bonne nouvelle !** Le composant est **100% rétrocompatible**. Votre code existant continuera de fonctionner sans modification.

### ✅ Code Existant (Fonctionne toujours)
```tsx
<HomeNews2
  title="Titre de l'article"
  coverImage={coverImage}
  excerpt="Extrait de l'article"
  slug="article-slug"
/>
```

## 📦 Nouvelles Dépendances

Assurez-vous d'avoir installé les dépendances requises :

```bash
npm install class-variance-authority lucide-react
```

## 🆕 Nouvelles Fonctionnalités Disponibles

### 1. Système de Variants
```tsx
// 4 variantes de design
<HomeNews2 variant="default" />     // Style standard
<HomeNews2 variant="featured" />    // Article à la une
<HomeNews2 variant="minimal" />     // Style épuré
<HomeNews2 variant="elevated" />    // Carte flottante
```

### 2. Tailles Configurables
```tsx
<HomeNews2 size="sm" />      // Petit (sidebar)
<HomeNews2 size="default" /> // Standard
<HomeNews2 size="lg" />      // Grand (hero)
<HomeNews2 size="full" />    // Pleine largeur
```

### 3. Métadonnées Enrichies
```tsx
<HomeNews2
  title="Titre"
  slug="slug"
  coverImage={coverImage}
  
  // Nouvelles métadonnées
  date={new Date().toISOString()}
  author={{ name: "Auteur", avatar: "/avatar.jpg" }}
  category={{ name: "Tech", slug: "tech" }}
  readTime={5}
  views={1250}
  featured={true}
/>
```

## 📋 Plan de Migration Étape par Étape

### Étape 1 : Migration de Base (0 changement)
Remplacez simplement l'ancien composant. Aucun changement visuel.

```tsx
// Avant et Après - identique
<HomeNews2
  title={post.title}
  coverImage={post.coverImage}
  excerpt={post.excerpt}
  slug={post.slug}
/>
```

### Étape 2 : Ajout des Métadonnées (optionnel)
Enrichissez progressivement avec les nouvelles données :

```tsx
<HomeNews2
  title={post.title}
  coverImage={post.coverImage}
  excerpt={post.excerpt}
  slug={post.slug}
  
  // Ajout progressif
  date={post.date}
  author={post.author}
  category={post.category}
/>
```

### Étape 3 : Utilisation des Variants (optionnel)
Appliquez les nouveaux styles selon vos besoins :

```tsx
// Article à la une
<HomeNews2
  {...post}
  variant="featured"
  featured={true}
  size="lg"
/>

// Articles secondaires
<HomeNews2
  {...post}
  variant="elevated"
  size="default"
/>
```

## 🎯 Cas d'Usage Spécifiques

### Page d'Accueil
```tsx
// Hero article
<HomeNews2
  {...heroPost}
  variant="featured"
  featured={true}
  size="lg"
/>

// Articles secondaires
{secondaryPosts.map(post => (
  <HomeNews2
    key={post.slug}
    {...post}
    variant="elevated"
    size="default"
  />
))}
```

### Liste de Catégorie
```tsx
{categoryPosts.map(post => (
  <HomeNews2
    key={post.slug}
    {...post}
    variant="default"
    size="sm"
    category={currentCategory}
  />
))}
```

### Sidebar
```tsx
{sidebarPosts.map(post => (
  <HomeNews2
    key={post.slug}
    {...post}
    variant="minimal"
    size="sm"
    layout="compact"
  />
))}
```

## 🔧 Adaptation des Données

### Format des Métadonnées
```typescript
// Structure recommandée pour les nouvelles props
interface PostData {
  title: string;
  slug: string;
  excerpt?: string;
  coverImage: { node: { sourceUrl: string } };
  
  // Nouvelles métadonnées
  date?: string; // ISO string
  author?: {
    name?: string;
    avatar?: string;
  };
  category?: {
    name: string;
    slug: string;
    color?: string;
  };
  readTime?: number; // en minutes
  views?: number;
  featured?: boolean;
}
```

### Adaptation depuis WordPress/CMS
```tsx
// Exemple d'adaptation depuis WordPress
const adaptPostData = (wpPost) => ({
  title: wpPost.title.rendered,
  slug: wpPost.slug,
  excerpt: wpPost.excerpt.rendered,
  coverImage: wpPost.featured_media_url,
  date: wpPost.date,
  author: {
    name: wpPost.author_name,
    avatar: wpPost.author_avatar,
  },
  category: {
    name: wpPost.categories[0]?.name,
    slug: wpPost.categories[0]?.slug,
  },
  readTime: calculateReadTime(wpPost.content.rendered),
  views: wpPost.view_count,
  featured: wpPost.sticky,
});
```

## 🎨 Personnalisation du Style

### Classes CSS Personnalisées
```tsx
<HomeNews2
  {...post}
  className="custom-news-card"
  variant="default"
/>
```

### Thème Personnalisé
```css
/* Personnalisation via CSS variables */
.custom-news-card {
  --card-bg: hsl(210 40% 98%);
  --card-border: hsl(214.3 31.8% 91.4%);
  --primary: hsl(222.2 47.4% 11.2%);
}
```

## 🧪 Tests et Validation

### Tests Visuels
```bash
# Démarrer la page de test
npm run dev
# Visiter /test-home-news2
```

### Tests d'Accessibilité
```bash
# Avec axe-core
npm run test:a11y

# Avec Lighthouse
lighthouse http://localhost:3000/test-home-news2 --only=accessibility
```

### Tests de Performance
```bash
# Bundle analyzer
npm run analyze

# Performance tests
npm run test:perf
```

## ⚠️ Points d'Attention

### 1. Images
- Assurez-vous que `coverImage.node.sourceUrl` est toujours défini
- Utilisez des images optimisées (WebP recommandé)
- Définissez `mediaDetails` pour de meilleures performances

### 2. Contenu HTML
- Le HTML est maintenant automatiquement sanitisé
- Vérifiez que vos styles personnalisés fonctionnent toujours
- Testez avec du contenu riche (listes, liens, etc.)

### 3. Performance
- Les nouvelles animations peuvent impacter les appareils faibles
- Testez sur mobile et tablette
- Surveillez les métriques Core Web Vitals

## 🐛 Dépannage

### Erreur : "cva is not defined"
```bash
npm install class-variance-authority
```

### Erreur : "Lucide icons not found"
```bash
npm install lucide-react
```

### Styles cassés
Vérifiez que Tailwind CSS inclut les nouvelles classes :
```js
// tailwind.config.js
module.exports = {
  content: [
    './components/**/*.{ts,tsx}',
    // ...
  ],
}
```

### Performance dégradée
```tsx
// Désactiver les animations sur mobile
<HomeNews2
  {...post}
  className="motion-reduce:transform-none"
/>
```

## 📊 Métriques de Migration

### Checklist de Migration
- [ ] Composant remplacé sans erreur
- [ ] Affichage visuel correct
- [ ] Métadonnées ajoutées (optionnel)
- [ ] Variants appliqués (optionnel)
- [ ] Tests d'accessibilité passés
- [ ] Performance vérifiée
- [ ] Tests sur mobile/tablette

### Indicateurs de Succès
- ✅ Aucune erreur TypeScript
- ✅ Affichage cohérent sur tous les écrans
- ✅ Animations fluides (60fps)
- ✅ Score d'accessibilité maintenu/amélioré
- ✅ Temps de chargement stable

## 🚀 Optimisations Recommandées

### 1. Lazy Loading
```tsx
import dynamic from 'next/dynamic';

const HomeNews2 = dynamic(() => import('./home-news2'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded" />
});
```

### 2. Memoization
```tsx
import { memo } from 'react';

const MemoizedHomeNews2 = memo(HomeNews2);
```

### 3. Image Optimization
```tsx
// Avec Next.js Image
import Image from 'next/image';

const optimizedCoverImage = {
  node: {
    sourceUrl: post.image,
    mediaDetails: {
      width: 800,
      height: 600,
    }
  }
};
```

## 📞 Support

### Ressources
- **Documentation** : `HOMENEWS2_IMPROVEMENTS.md`
- **Page de test** : `/test-home-news2`
- **Showcase** : `HomeNews2Showcase.tsx`

### Problèmes Courants
1. **Migration progressive** : Commencez par les pages les moins critiques
2. **Tests A/B** : Comparez l'ancien et le nouveau design
3. **Feedback utilisateur** : Collectez les retours sur la nouvelle UX

### Contact
- Créez une issue GitHub pour les bugs
- Consultez la documentation pour les questions
- Testez sur la page de démonstration

## ✨ Conclusion

La migration vers HomeNews2 v2.0 apporte :
- 🎨 **Design moderne** et professionnel
- 📊 **Métadonnées enrichies** pour une meilleure UX
- ♿ **Accessibilité complète** pour tous les utilisateurs
- ⚡ **Performance optimisée** avec animations fluides
- 🔧 **Flexibilité** avec de nombreuses options de personnalisation

La migration peut être progressive et sans risque grâce à la rétrocompatibilité complète ! 🚀
