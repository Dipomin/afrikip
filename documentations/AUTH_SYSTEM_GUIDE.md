# 🔐 Système d'Authentification et Gestion des Accès PDF - Afrikipresse

## 📋 Vue d'ensemble

Système complet d'authentification et de gestion des accès aux journaux PDF avec:
- **Authentification Supabase** pour les utilisateurs
- **Système d'abonnement** (mensuel, semestriel, annuel)
- **Achats individuels** via CinetPay (200 F CFA/PDF)
- **Contrôle d'accès** basé sur l'abonnement OU l'achat
- **Tableau de bord utilisateur** complet

---

## 🏗️ Architecture

### 1. Authentification (Supabase)

```
Tables Supabase:
├── users (auth.users)
│   ├── id (UUID)
│   ├── email
│   ├── full_name
│   └── avatar_url
│
├── subscriptions
│   ├── id (Stripe subscription_id)
│   ├── user_id (FK → users.id)
│   ├── status (trialing, active, canceled, etc.)
│   ├── price_id (FK → prices.id)
│   ├── current_period_start
│   ├── current_period_end
│   └── cancel_at_period_end
│
├── prices
│   ├── id (Stripe price_id)
│   ├── product_id (FK → products.id)
│   ├── unit_amount (1500, 8000, 15000)
│   ├── interval (month, year)
│   └── interval_count
│
└── products
    ├── id (Stripe product_id)
    ├── name (Mensuel, Semestriel, Annuel)
    └── description
```

### 2. Achats individuels (Firestore)

```
Collection: orders
├── customer
│   ├── firstName
│   ├── lastName
│   ├── email (utilisé pour lier au user Supabase)
│   ├── phone
│   ├── city
│   └── country
│
├── items[] (PDFs achetés)
│   ├── id (PDF ID)
│   ├── title
│   ├── coverImageURL
│   ├── price (200 F CFA)
│   └── pdfURL
│
├── total
├── status (pending, paid, failed)
├── transactionId (CinetPay)
├── createdAt
└── paidAt
```

### 3. Hiérarchie des accès

```
┌──────────────────────────────────────┐
│     Utilisateur non connecté         │
│  ► Voit uniquement la page preview   │
│  ► Peut ajouter au panier           │
│  ► Doit se connecter pour lire       │
└──────────────────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│    Utilisateur connecté (no sub)     │
│  ► Voit la page détail complète      │
│  ► Peut acheter individuellement      │
│  ► Peut s'abonner                    │
└──────────────────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│   Utilisateur avec abonnement actif  │
│  ► Accès illimité à TOUS les PDFs    │
│  ► Peut gérer son abonnement         │
│  ► Tableau de bord complet           │
└──────────────────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│   Utilisateur ayant acheté le PDF    │
│  ► Accès au PDF acheté uniquement    │
│  ► Téléchargement autorisé           │
│  ► Historique des commandes          │
└──────────────────────────────────────┘
```

---

## 📂 Fichiers créés/modifiés

### Nouveaux fichiers

#### 1. **lib/supabase-client.ts**
Client Supabase pour le côté client
```typescript
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

#### 2. **lib/supabase-server.ts**
Fonctions server-side pour SSR
```typescript
export const getSession(ctx)
export const getUser(ctx)
export const getSubscription(ctx)
export const checkPDFAccess(ctx, pdfId)
```

#### 3. **hooks/useAuth.ts**
Hooks React pour authentification
```typescript
export function useAuth() // user, session, loading
export function useSubscription() // subscription, loading
export function usePDFAccess(pdfId) // hasAccess, accessReason, loading
```

#### 4. **pages/api/check-pdf-access.ts**
API route pour vérifier l'accès aux PDFs achetés
```
GET /api/check-pdf-access?pdfId=xxx&userId=yyy
→ { hasAccess: boolean }
```

#### 5. **pages/lintelligentpdf/[id].tsx**
Page de détail du PDF (preview mode)
- Affiche infos complètes (titre, description, tags, métadonnées)
- Bouton "Acheter 200 F CFA" ou "Dans le panier"
- Section "PDFs recommandés" (par tags ou 4 derniers)
- Redirection vers `/signin` si non connecté
- Accès lecteur si abonné/acheté

#### 6. **pages/lintelligentpdf/read/[id].tsx**
Lecteur PDF sécurisé
- Vérification authentification + accès (abonnement OU achat)
- Barre d'outils: zoom, rotation, téléchargement, impression
- Contrôles de navigation
- Incrémentation automatique des vues
- Plein écran

#### 7. **pages/dashboard.tsx**
Tableau de bord utilisateur complet
- **Onglet Vue d'ensemble**: stats, abonnement, derniers achats
- **Onglet Profil**: infos personnelles, déconnexion
- **Onglet Abonnement**: statut, gestion, upgrade
- **Onglet Mes PDFs**: liste des PDFs achetés avec bouton "Lire"
- **Onglet Commandes**: historique complet avec détails

#### 8. **components/SupabaseProvider.tsx**
Provider React pour Supabase
- Gère la session globalement
- Écoute les changements d'authentification
- Utilisé dans `_app.tsx`

### Fichiers modifiés

#### 9. **pages/lintelligentpdf/index.tsx**
Boutique principale
- ❌ Suppression du modal `JournalModal`
- ✅ Redirection vers `/lintelligentpdf/[id]` au clic
- ✅ Bouton "Mon tableau de bord" dans le header
- Conserve: recherche, filtres, grille/liste

#### 10. **pages/_app.tsx**
Provider racine
```tsx
<SupabaseProvider>
  <CartProvider>
    <Component />
    <CartButton />
  </CartProvider>
</SupabaseProvider>
```

---

## 🔄 Flux utilisateur

### Scénario 1: Utilisateur non connecté

1. Visite `/lintelligentpdf` → voit la boutique
2. Clique sur un journal → `/lintelligentpdf/[id]`
3. Voit page preview avec:
   - Couverture verrouillée (icône Lock)
   - Détails du journal
   - Prix 200 F CFA
   - Bouton "Se connecter pour accéder"
4. Clique → `/signin?redirect=/lintelligentpdf/[id]`
5. Se connecte → revient sur la page détail
6. Peut maintenant acheter OU s'abonner

### Scénario 2: Utilisateur connecté sans abonnement

1. Visite `/lintelligentpdf/[id]`
2. Voit:
   - Bouton "Ajouter au panier - 200 F CFA"
   - Lien "S'abonner pour un accès illimité"
3. **Option A**: Achète individuellement
   - Ajoute au panier → `/checkout`
   - Paie via CinetPay
   - Reçoit confirmation → `/order-success`
   - Peut lire le PDF → `/lintelligentpdf/read/[id]`
4. **Option B**: S'abonne
   - Va sur `/abonnement`
   - Choisit formule (mensuel/semestriel/annuel)
   - Paie via Stripe
   - Accès illimité à tous les PDFs

### Scénario 3: Utilisateur avec abonnement actif

1. Visite `/lintelligentpdf/[id]`
2. Voit badge "Accès illimité" (icône Unlock)
3. Clique "Lire maintenant" → `/lintelligentpdf/read/[id]`
4. Lecteur PDF s'ouvre avec tous les contrôles
5. Peut télécharger, zoomer, imprimer, etc.

### Scénario 4: Utilisateur ayant acheté le PDF

1. Visite `/lintelligentpdf/[id]` d'un PDF acheté
2. Voit "Vous avez acheté ce journal"
3. Clique "Lire maintenant" → lecteur s'ouvre
4. Va sur `/dashboard` → onglet "Mes PDFs"
5. Voit tous ses achats avec boutons "Lire"

---

## 🎯 Fonctionnalités du tableau de bord

### Vue d'ensemble
- **4 cartes statistiques**:
  - Nombre de PDFs achetés
  - Nombre de commandes payées
  - Total dépensé (F CFA)
  - Statut abonnement (Actif/Inactif)
- **Section abonnement**:
  - Badge de statut (actif/inactif)
  - Prix, date d'expiration, jours restants
  - Bouton "Gérer l'abonnement"
  - Bouton "Passer à l'annuel" (si mensuel)
- **Derniers achats**: 4 PDFs avec aperçu

### Profil
- Email (non modifiable)
- Nom complet (modifiable)
- Avatar (à implémenter upload)
- Bouton déconnexion

### Abonnement
- **Si actif**:
  - Badge vert "Abonnement actif"
  - Détails: formule, prochain renouvellement
  - Bouton "Gérer sur Stripe"
  - Bouton "Passer à l'annuel"
- **Si inactif**:
  - Message invitation
  - Bouton "Voir les offres"

### Mes PDFs
- Grille de tous les PDFs achetés
- Couverture + titre
- Bouton "Lire" → `/lintelligentpdf/read/[id]`
- Si vide: message + lien boutique

### Commandes
- Liste complète des commandes
- Tri par date (plus récent en premier)
- Pour chaque commande:
  - ID transaction
  - Date de création
  - Badge statut (Payée/En attente/Échouée)
  - Liste des items avec miniatures
  - Total
  - Bouton "Voir détails" (si payée)

---

## 🔒 Sécurité

### Vérification d'accès (côté serveur)

**SSR dans getServerSideProps**:
```typescript
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: '/signin',
        permanent: false,
      },
    };
  }

  const subscription = await getSubscription(context);
  const { hasAccess } = await checkPDFAccess(context, pdfId);

  return {
    props: {
      user: session.user,
      subscription,
      hasAccess,
    },
  };
};
```

### Vérification d'accès (côté client)

**Hooks React**:
```typescript
const { user, loading: authLoading } = useAuth();
const { subscription, loading: subLoading } = useSubscription();
const { hasAccess, accessReason } = usePDFAccess(pdfId);

// accessReason: 'subscription' | 'purchase' | 'none'
```

### Règles Firestore (orders)

```javascript
match /orders/{orderId} {
  allow read: if isAuthenticated() && 
                 (request.auth.uid == resource.data.userId || isAdmin());
  allow create: if true; // API routes
  allow update: if true; // Webhooks CinetPay
  allow delete: if isAdmin();
}
```

---

## 🛠️ Installation & Configuration

### 1. Installer les dépendances

```bash
npm install @supabase/supabase-js
# ou
yarn add @supabase/supabase-js
```

### 2. Variables d'environnement

Vérifier que `.env.local` contient:
```bash
# Supabase (déjà configuré normalement)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... # SERVER ONLY

# CinetPay (à compléter)
CINETPAY_KEY=votre_cle_api
CINETPAY_SITE_ID=votre_site_id
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Firebase (déjà configuré)
NEXT_PUBLIC_FIREBASE_API_KEY=...
# ... autres variables Firebase
```

### 3. Configurer Supabase

**Tables nécessaires** (normalement déjà créées):
- ✅ `users` (via auth.users)
- ✅ `customers` (lien Stripe ↔ Supabase)
- ✅ `subscriptions` (sync Stripe)
- ✅ `prices` (produits Stripe)
- ✅ `products` (offres d'abonnement)

**Policies RLS** (vérifier):
```sql
-- subscriptions: l'utilisateur voit uniquement ses abonnements
CREATE POLICY "Can only view own subs data." 
ON subscriptions FOR SELECT 
USING (auth.uid() = user_id);
```

### 4. Configurer Firebase

**Collection Firestore**:
- ✅ `orders` (déjà configurée)
- ✅ `archives/pdf/{year}/{docId}` (journaux)

**Règles Firestore** (déjà déployées):
```javascript
match /orders/{orderId} {
  allow read: if isAuthenticated() && 
                 (request.auth.uid == resource.data.userId || isAdmin());
  allow create: if true;
  allow update: if true;
  allow delete: if isAdmin();
}
```

### 5. Lancer l'application

```bash
npm run dev
# Serveur démarrera sur http://localhost:3000 ou 3001
```

---

## 🧪 Tests

### Test 1: Utilisateur non connecté

```bash
# 1. Ouvrir en navigation privée
http://localhost:3000/lintelligentpdf

# 2. Cliquer sur un journal
→ Redirection vers /lintelligentpdf/[id]

# 3. Vérifier affichage
✅ Couverture avec overlay "Aperçu uniquement"
✅ Badge "Verrouillé" (Lock icon)
✅ Détails du journal visibles
✅ Bouton "Se connecter pour accéder"

# 4. Cliquer sur "Se connecter"
→ Redirection vers /signin?redirect=/lintelligentpdf/[id]
```

### Test 2: Utilisateur connecté sans abonnement

```bash
# 1. Se connecter
http://localhost:3000/signin

# 2. Aller sur un journal
http://localhost:3000/lintelligentpdf/[id]

# 3. Vérifier affichage
✅ Bouton "Ajouter au panier - 200 F CFA"
✅ Lien "S'abonner pour un accès illimité"
✅ Pas de badge "Accès illimité"

# 4. Ajouter au panier
→ Badge panier affiche "1"
→ Bouton devient "Dans le panier - Finaliser"

# 5. Cliquer "Finaliser"
→ Redirection vers /checkout

# 6. Compléter paiement
→ Redirection CinetPay
→ Retour sur /order-success

# 7. Vérifier accès
http://localhost:3000/lintelligentpdf/read/[id]
✅ Lecteur PDF s'ouvre
✅ Tous les contrôles disponibles
```

### Test 3: Utilisateur avec abonnement actif

```bash
# 1. Se connecter avec compte abonné
http://localhost:3000/signin

# 2. Aller sur tableau de bord
http://localhost:3000/dashboard

# 3. Vérifier statut abonnement
✅ Badge "Actif" vert
✅ Détails: formule, date fin, jours restants
✅ Statistiques affichées

# 4. Aller sur n'importe quel journal
http://localhost:3000/lintelligentpdf/[id]

# 5. Vérifier affichage
✅ Badge "Accès illimité" (Unlock icon)
✅ Bouton "Lire maintenant"
✅ Pas de prix affiché

# 6. Cliquer "Lire maintenant"
→ Lecteur PDF s'ouvre immédiatement
✅ Téléchargement autorisé
✅ Tous les contrôles disponibles
```

### Test 4: Tableau de bord

```bash
# 1. Se connecter
http://localhost:3000/dashboard

# 2. Tester chaque onglet
✅ Vue d'ensemble: stats + abonnement + derniers achats
✅ Profil: email + nom + déconnexion
✅ Abonnement: statut + gestion
✅ Mes PDFs: liste des achats avec bouton "Lire"
✅ Commandes: historique complet

# 3. Cliquer "Lire" sur un PDF acheté
→ Redirection vers /lintelligentpdf/read/[id]
✅ Lecteur s'ouvre
```

---

## 🐛 Dépannage

### Erreur: "useAuth must be used inside SupabaseProvider"

**Cause**: `_app.tsx` ne wrap pas l'app avec `<SupabaseProvider>`

**Solution**:
```tsx
// pages/_app.tsx
<SupabaseProvider>
  <CartProvider>
    <Component {...pageProps} />
  </CartProvider>
</SupabaseProvider>
```

### Erreur: "Cannot read property 'status' of null"

**Cause**: L'utilisateur n'a pas d'abonnement mais le code essaie d'accéder à `subscription.status`

**Solution**: Toujours vérifier `subscription` avant d'accéder aux propriétés:
```typescript
if (subscription && subscription.status === 'active') {
  // ...
}
```

### Erreur: "PERMISSION_DENIED" sur Firestore

**Cause**: Règles Firestore bloquent l'accès

**Solution**: Vérifier que les règles sont déployées:
```bash
firebase deploy --only firestore:rules
```

### Erreur: "No user found" sur check-pdf-access

**Cause**: L'API cherche par email mais l'email dans Firestore ne correspond pas

**Solution**: Vérifier que `customer.email` dans les commandes correspond à l'email Supabase:
```typescript
// pages/api/check-pdf-access.ts
const q = query(
  ordersRef,
  where('customer.email', '==', user.email), // ← Important
  where('status', '==', 'paid')
);
```

### PDFs recommandés ne s'affichent pas

**Cause**: Les PDFs n'ont pas de tags OU tags ne correspondent pas

**Solution**: Le système fallback automatiquement sur les 4 derniers PDFs si pas de tags communs

### Lecteur PDF ne charge pas

**Cause**: URL du PDF incorrecte OU CORS non configuré

**Solution**:
1. Vérifier que `pdfURL` existe dans Firestore
2. Vérifier CORS Firebase Storage:
```bash
gsutil cors set cors.json gs://lia-pdf.appspot.com
```

---

## 🚀 Améliorations futures

### Court terme

- [ ] **Email de confirmation** après achat (SendGrid/Resend)
- [ ] **Upload avatar** dans profil utilisateur
- [ ] **Modification profil** (nom, téléphone)
- [ ] **Historique des lectures** (derniers PDFs consultés)
- [ ] **Favoris/Wishlist** pour sauvegarder des PDFs

### Moyen terme

- [ ] **Tokens d'accès PDF** (JWT) pour sécuriser les URLs
- [ ] **Download limité** (max 3 téléchargements par PDF acheté)
- [ ] **Codes promo** pour réductions
- [ ] **Offres groupées** (5 PDFs pour 800 F au lieu de 1000)
- [ ] **Cadeau de journal** (envoyer à un ami)

### Long terme

- [ ] **Application mobile** (React Native)
- [ ] **Mode hors ligne** (téléchargement pour lecture offline)
- [ ] **Annotations PDF** (surligner, notes)
- [ ] **Partage social** (Facebook, Twitter, WhatsApp)
- [ ] **Programme de fidélité** (points par achat)

---

## 📊 Métriques à suivre

### Engagement utilisateur
- Nombre d'utilisateurs inscrits
- Taux de conversion (visiteur → inscrit)
- Taux d'abonnement (inscrit → abonné)
- Taux d'achat individuel

### Revenus
- MRR (Monthly Recurring Revenue) - abonnements
- Revenus achats individuels
- Taux de renouvellement abonnements
- Valeur vie client (LTV)

### Contenu
- PDFs les plus consultés
- PDFs les plus téléchargés
- PDFs les plus achetés
- Tags les plus populaires

### Performance
- Temps de chargement page détail
- Temps de chargement lecteur PDF
- Taux d'abandon panier
- Taux de réussite paiement

---

## 📝 Changelog

### Version 1.0.0 (25 novembre 2025)

**Ajouté**:
- ✅ Système d'authentification Supabase complet
- ✅ Hooks useAuth, useSubscription, usePDFAccess
- ✅ Page détail PDF avec preview mode
- ✅ Lecteur PDF sécurisé avec contrôles
- ✅ Tableau de bord utilisateur (5 onglets)
- ✅ Gestion abonnement (Stripe)
- ✅ Intégration achats individuels (CinetPay + Firestore)
- ✅ PDFs recommandés par tags
- ✅ Statistiques utilisateur
- ✅ Historique des commandes
- ✅ Liste des PDFs achetés

**Modifié**:
- ✅ Boutique principale (redirection vers pages détail)
- ✅ _app.tsx (ajout SupabaseProvider)

**Sécurité**:
- ✅ Vérification authentification côté serveur (SSR)
- ✅ Vérification accès PDF (abonnement OU achat)
- ✅ API route check-pdf-access
- ✅ Règles Firestore pour orders

**Documentation**:
- ✅ Guide complet (ce fichier)
- ✅ Architecture système
- ✅ Flux utilisateur
- ✅ Tests
- ✅ Dépannage

---

## 🤝 Support

Pour toute question ou problème:
1. Consulter cette documentation
2. Vérifier les logs console (navigateur + serveur)
3. Vérifier les règles Firestore
4. Vérifier les variables d'environnement
5. Tester en navigation privée (cache)

---

**Date de création**: 25 novembre 2025  
**Version**: 1.0.0  
**Auteur**: GitHub Copilot  
**Status**: ✅ Production ready (après configuration clés CinetPay)
