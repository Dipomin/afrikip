# Instructions pour les Agents IA - Afrikipresse

## Vue d'ensemble du projet

Afrikipresse est un site d'actualités africaines avec architecture hybride **Next.js 14 Pages Router** (⚠️ **PAS App Router**):

- **Frontend**: Next.js 14 (Pages Router) + TypeScript + Tailwind CSS + shadcn/ui
- **CMS Principal**: WordPress + WPGraphQL (`lib/api.ts`) pour contenu éditorial
- **Base de données legacy**: MySQL + Prisma (`prisma/schema.prisma`) - tables préfixées `ap_*`
- **Authentification**: Supabase Auth Helpers (`0000app.OLD/supabase-provider.tsx`, `supabase-server.ts`)
- **Paiements**: Stripe (cartes EUR) + CinetPay (Mobile Money XOF pour Afrique)
- **Storage**: Firebase Storage uniquement pour PDFs archives (`firebase.ts`)
- **Analytics**: Vercel Analytics + Google Analytics (GA4)

## Architecture Next.js hybride

### Structure des dossiers (CRITIQUE)

```
pages/               # Pages Router principal (SSR/SSG)
  ├── _app.tsx       # Provider racine, Modal.setAppElement
  ├── _document.tsx
  ├── index.tsx      # Homepage avec ISR (revalidate: 3600)
  ├── article/[slug].tsx  # Articles WordPress GraphQL
  ├── categorie/[category].tsx  # MySQL direct via Prisma
  ├── api/           # API Routes (Apollo Server, webhooks)
  │   ├── search/    # Apollo GraphQL custom pour recherche
  │   ├── cinetpay-{a,m,s}/  # Paiements mobile
  │   └── stripeUsers/
  └── mobile-payment/

0000app.OLD/         # Ancien App Router (layout référence)
  ├── supabase-provider.tsx  # ⚠️ À importer depuis ici
  └── supabase-server.ts     # getSession(), getSubscription()

components/          # Components React (kebab-case)
  ├── CategorySection.tsx    # Variants cva(), modernized design
  ├── home-news2.tsx         # Homepage sections
  └── ui/                    # shadcn/ui components

lib/
  ├── api.ts         # fetchAPI() pour WordPress GraphQL
  └── prisma.ts      # PrismaClient singleton
```

### Patterns de routing

- **ISR Pages**: `pages/article/[slug].tsx` avec `revalidate: 3600`
- **SSR dynamique**: `pages/categorie/[category].tsx` via `getServerSideProps`
- **Client Components**: Toujours ajouter `"use client"` pour hooks React (useState, useEffect)
- **Middleware**: `middleware.ts` avec whitelist paths (plus de 100 routes autorisées)

## Sources de données (architecture multi-source)

### 1. WordPress GraphQL (principal)

```typescript
// lib/api.ts - Utiliser fetchAPI pour tous les calls WordPress
const data = await fetchAPI(`
  query {
    posts(first: 50) {
      edges {
        node {
          title
          slug
          excerpt
          featuredImage { node { sourceUrl } }
          categories { edges { node { name slug } } }
        }
      }
    }
  }
`);
```

**Fragments standards**: Toujours inclure `featuredImage`, `categories`, `date`, `excerpt`

### 2. MySQL Legacy (Prisma)

```typescript
// pages/api/search/index.ts - Apollo Server avec Prisma
const articles = await prismadb.$queryRaw`
  SELECT * FROM ap_posts
  WHERE LOWER(post_title) LIKE ${`%${keyword}%`}
    AND post_status = 'publish'
  ORDER BY post_date DESC
`;
```

**Tables critiques**: `ap_posts`, `ap_terms`, `ap_term_relationships`, `ap_postmeta`  
**Queries optimisées**: `pages/categorie/[category].tsx` (pagination 50 items, counts séparés)

### 3. Supabase (Auth + Subscriptions)

```typescript
// Pattern authentification SERVER-SIDE
import { getSession, getSubscription } from './0000app.OLD/supabase-server';

const session = await getSession();
const subscription = await getSubscription();

// Vérifier accès premium
if (session && subscription?.status === 'active') {
  // Contenu premium
}
```

**Tables**: `users`, `subscriptions`, `products`, `prices`, `customers`  
**Webhooks**: `utils/supabase-admin.ts` sync Stripe → Supabase (SERVICE_ROLE_KEY)

### 4. Firebase (Storage uniquement)

```typescript
// firebase.ts - Uniquement pour PDFs archives journaux
import { storage } from './firebase';
// ⚠️ NE PAS utiliser pour auth ou autre
```

## Système de paiement dual

### Stripe (Cartes bancaires EUR)

- Routes: `pages/abonnement/` 
- Webhooks: `pages/api/webhooks/` → sync vers Supabase
- Client: `@stripe/stripe-js` + `@stripe/react-stripe-js`

### CinetPay (Mobile Money XOF)

```typescript
// pages/api/cinetpay-{a,m,s}/index.ts
const response = await axios.post('https://api-checkout.cinetpay.com/v2/payment', {
  apikey: process.env.CINETPAY_KEY,
  site_id: process.env.CINETPAY_SITE_ID,
  channels: "MOBILE_MONEY",
  notify_url: `${SITE_URL}/mobile-payment/notify`
});
```

**Variantes**: `-a` (annuel), `-m` (mensuel), `-s` (semestriel)

## Conventions de développement

### Composants et styling

```typescript
// components/CategorySection.tsx - Pattern avec cva
import { cva, type VariantProps } from "class-variance-authority";

const sectionVariants = cva("base-classes", {
  variants: {
    variant: {
      default: ["bg-gradient-to-br", "shadow-xl"],
      featured: ["bg-gradient-to-br from-red-50", "shadow-2xl"]
    }
  }
});
```

**Naming**: kebab-case pour fichiers (`home-news2.tsx`), PascalCase pour exports  
**Shadcn/ui**: `@/components/ui/` avec Radix UI + Tailwind  
**Icons**: `lucide-react` (préféré), `react-icons` (legacy)

### Variables d'environnement

```bash
# WordPress (OBLIGATOIRE)
WORDPRESS_API_URL=https://adm.afrikipresse.fr/graphql
WORDPRESS_AUTH_REFRESH_TOKEN=...  # Preview mode

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  # ⚠️ SERVER-SIDE ONLY

# Stripe
STRIPE_PUBLISHABLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# CinetPay
CINETPAY_KEY=...
CINETPAY_SITE_ID=...

# MySQL
DATABASE_URL=mysql://user:pass@host:3306/db
```

### Images et CDN

```javascript
// next.config.js - Domaines autorisés
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'adm.afrikipresse.fr' },
    { protocol: 'https', hostname: 'xmkowggghwqpeccgymgi.supabase.co' },
    { protocol: 'https', hostname: 'images.unsplash.com' }
  ]
}
```

## Commandes essentielles

```bash
# Setup
npm install
npx prisma generate  # Auto dans postinstall

# Dev
npm run dev          # :3000 avec Fast Refresh
npm run build        # Build production (180s timeout)
npm run start        # Serveur prod

# Database
npx prisma studio    # Interface MySQL
npx prisma db pull   # Sync schema depuis DB

# Lint/Format
npm run lint         # ESLint Next.js
```

## Points d'attention critiques

### ❌ Anti-patterns

- **Ne JAMAIS** exposer `SUPABASE_SERVICE_ROLE_KEY` côté client
- **Ne PAS** faire `import from 'app/'` (utiliser `0000app.OLD/` ou `pages/`)
- **Ne PAS** utiliser Firebase pour auth (uniquement storage PDFs)
- **Éviter** Prisma queries directes côté client (passer par `/api/`)
- **Ne PAS** oublier `revalidate` sur pages ISR (défaut 3600s)

### ✅ Best practices

- **Modal.setAppElement**: Déjà configuré dans `_app.tsx` avec `#__next`
- **SupabaseProvider**: Wrapper `children` avec `<SupabaseProvider>` pour auth state
- **GraphQL batching**: WordPress supporte jusqu'à 14000 posts par query (voir `getAllPostsWithSlug`)
- **ISR timeout**: `staticPageGenerationTimeout: 180` dans `next.config.js`
- **Vercel Functions**: `vercel.json` augmente memory/duration pour sitemaps

## Debugging

- **API Routes**: Console.log structurés (voir `pages/api/search/index.ts`)
- **GraphQL errors**: `json.errors` capturés dans `lib/api.ts`
- **Supabase auth**: Events dans `supabase-provider.tsx` (SIGNED_IN → router.refresh)
- **Prisma queries**: `npx prisma studio` pour inspecter data
- **Build errors**: Vérifier `tsconfig.json` (strict: false, strictNullChecks: true)

## Migration notes

- Ancien `app/` renommé `0000app.OLD/` mais **toujours utilisé** pour layout/providers
- PWA configuré avec `next-pwa` (disabled en dev, actif en prod)
- Google Analytics via `@next/third-parties/google` dans `_app.tsx`
- Sitemap custom API routes avec timeout 60s (Vercel config)
