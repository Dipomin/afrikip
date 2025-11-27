# 🔥 Guide de Migration Firebase - Afrikipresse

## Vue d'ensemble

Ce guide documente la migration complète de **Supabase Auth** vers **Firebase Auth** et **Firestore** pour le système d'authentification et de gestion des abonnements PDF.

---

## Changements effectués

### 1. Authentification : Supabase Auth → Firebase Auth

#### Avant (Supabase)
```typescript
import { supabase } from '../lib/supabase-client';

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// Logout
await supabase.auth.signOut();

// Get user
const { data: { user } } = await supabase.auth.getUser();
```

#### Après (Firebase)
```typescript
import { auth } from '../firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// Login
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const user = userCredential.user;

// Logout
await signOut(auth);

// Listen to auth state
onAuthStateChanged(auth, (user) => {
  // user is User | null
});
```

---

### 2. Base de données : Supabase Tables → Firestore Collections

#### Collections Firestore créées

**Collection `users`**
```typescript
{
  id: string;              // Firebase UID
  email: string;
  full_name?: string;
  avatar_url?: string;
  billing_address?: object;
  payment_method?: object;
  created_at: Timestamp;
}
```

**Collection `subscriptions`**
```typescript
{
  id: string;                    // Document ID (généré par Firestore)
  user_id: string;               // Firebase UID
  status: string;                // 'active' | 'trialing' | 'canceled' | ...
  price_id: string;              // Référence à prices collection
  quantity: number;
  cancel_at_period_end: boolean;
  created: string;               // ISO date
  current_period_start: string;  // ISO date
  current_period_end: string;    // ISO date
  ended_at?: string;
  cancel_at?: string;
  canceled_at?: string;
  trial_start?: string;
  trial_end?: string;
  metadata?: object;
}
```

**Collection `prices`**
```typescript
{
  id: string;                // Stripe Price ID
  product_id: string;        // Référence à products collection
  active: boolean;
  currency: string;          // 'xof', 'eur', etc.
  description?: string;
  unit_amount: number;       // En centimes
  type: string;              // 'recurring' | 'one_time'
  interval?: string;         // 'month' | 'year'
  interval_count?: number;   // 1, 6, 12
  trial_period_days?: number;
  metadata?: object;
}
```

**Collection `products`**
```typescript
{
  id: string;          // Stripe Product ID
  active: boolean;
  name: string;        // 'Mensuel', 'Semestriel', 'Annuel'
  description?: string;
  image?: string;
  metadata?: object;
}
```

**Collection `customers`** (mapping Firebase UID ↔ Stripe Customer ID)
```typescript
{
  id: string;                 // Firebase UID
  stripe_customer_id: string; // Stripe Customer ID
}
```

---

### 3. Fichiers modifiés

#### `lib/supabase-client.ts` → Simplifié
**Avant:**
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

**Après:**
```typescript
import { auth, db } from '../firebase';

export { auth, db };
```

---

#### `lib/supabase-server.ts` → `lib/firebase-server.ts`
**Modifications:**
- Utilise Firebase Admin SDK pour vérifier les tokens JWT
- Les tokens sont stockés dans les cookies (`firebaseToken`)
- Les queries Firestore remplacent les queries SQL Supabase

**Fonctions:**
- `getSession(ctx)` → Vérifie le token Firebase Admin
- `getUser(ctx)` → Retourne l'utilisateur Firebase
- `getSubscription(ctx)` → Query Firestore collection `subscriptions`
- `checkPDFAccess(ctx, pdfId)` → Vérifie abonnement + achats Firestore

---

#### `hooks/useAuth.ts`
**Modifications:**
- `onAuthStateChanged` remplace `supabase.auth.onAuthStateChange`
- Queries Firestore remplacent les queries Supabase
- Stocke automatiquement le token dans les cookies pour SSR

**Hooks:**
- `useAuth()` → `{ user, loading }`
- `useSubscription()` → `{ subscription, loading }`
- `usePDFAccess(pdfId)` → `{ hasAccess, accessReason, loading }`

---

#### `components/SupabaseProvider.tsx` → `FirebaseAuthProvider.tsx`
**Modifications:**
- Utilise `onAuthStateChanged` de Firebase
- Stocke le token dans les cookies automatiquement
- Export `useFirebaseAuth()` hook

---

#### `pages/_app.tsx`
**Modifications:**
```diff
- import SupabaseProvider from "../components/SupabaseProvider";
+ import FirebaseAuthProvider from "../components/SupabaseProvider";

- <SupabaseProvider>
+ <FirebaseAuthProvider>
    <CartProvider>
      <Component {...pageProps} />
    </CartProvider>
- </SupabaseProvider>
+ </FirebaseAuthProvider>
```

---

#### `pages/dashboard.tsx`
**Modifications:**
- `signOut(auth)` remplace `supabase.auth.signOut()`
- Queries Firestore pour charger le profil utilisateur
- Utilise `doc()`, `getDoc()`, `updateDoc()` de Firestore

---

#### `pages/api/check-pdf-access.ts`
**Modifications:**
- Change le paramètre de `userId` à `userEmail`
- Query Firestore `orders` collection par email

---

#### `utils/supabase-admin.ts` → `utils/firebase-admin.ts`
**Modifications:**
- Remplace tous les `supabaseAdmin` queries par Firestore
- Utilise `setDoc()`, `getDoc()`, `getDocs()`, `query()`, `where()`
- Les webhooks Stripe écrivent maintenant dans Firestore

---

### 4. Variables d'environnement

#### À supprimer (Supabase)
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

#### À ajouter (Firebase Admin - pour SSR)
```bash
FIREBASE_PROJECT_ID=lia-pdf
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@lia-pdf.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...-----END PRIVATE KEY-----\n"
```

#### Déjà configurées (Firebase Client - inchangées)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA4vVaK3r-QiEdcL2a7PaLZIxOub795Ry4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=lia-pdf.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=lia-pdf
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=lia-pdf.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=235398791352
NEXT_PUBLIC_FIREBASE_APP_ID=1:235398791352:web:ba83aeaa6c3cf6267cf44d
```

---

## Migration des données existantes

### Étape 1: Exporter les données de Supabase

```bash
# Utiliser l'interface Supabase pour exporter:
# 1. Table users → CSV
# 2. Table subscriptions → CSV
# 3. Table prices → CSV
# 4. Table products → CSV
# 5. Table customers → CSV
```

### Étape 2: Importer dans Firestore

#### Script de migration (Node.js)
```typescript
import admin from 'firebase-admin';
import { parse } from 'csv-parse/sync';
import fs from 'fs';

// Initialiser Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert('./serviceAccountKey.json')
});

const db = admin.firestore();

async function migrateUsers() {
  const csv = fs.readFileSync('./users.csv', 'utf-8');
  const users = parse(csv, { columns: true });
  
  for (const user of users) {
    await db.collection('users').doc(user.id).set({
      email: user.email,
      full_name: user.full_name || '',
      avatar_url: user.avatar_url || '',
      created_at: admin.firestore.Timestamp.fromDate(new Date(user.created_at))
    });
  }
  
  console.log(`✅ ${users.length} users migrated`);
}

async function migrateSubscriptions() {
  const csv = fs.readFileSync('./subscriptions.csv', 'utf-8');
  const subscriptions = parse(csv, { columns: true });
  
  for (const sub of subscriptions) {
    await db.collection('subscriptions').doc(sub.id).set({
      user_id: sub.user_id,
      status: sub.status,
      price_id: sub.price_id,
      quantity: parseInt(sub.quantity) || 1,
      cancel_at_period_end: sub.cancel_at_period_end === 'true',
      created: sub.created,
      current_period_start: sub.current_period_start,
      current_period_end: sub.current_period_end,
      ended_at: sub.ended_at || null,
      cancel_at: sub.cancel_at || null,
      canceled_at: sub.canceled_at || null,
      trial_start: sub.trial_start || null,
      trial_end: sub.trial_end || null,
      metadata: JSON.parse(sub.metadata || '{}')
    });
  }
  
  console.log(`✅ ${subscriptions.length} subscriptions migrated`);
}

async function migratePrices() {
  const csv = fs.readFileSync('./prices.csv', 'utf-8');
  const prices = parse(csv, { columns: true });
  
  for (const price of prices) {
    await db.collection('prices').doc(price.id).set({
      product_id: price.product_id,
      active: price.active === 'true',
      currency: price.currency,
      description: price.description || null,
      unit_amount: parseInt(price.unit_amount) || 0,
      type: price.type,
      interval: price.interval || null,
      interval_count: parseInt(price.interval_count) || null,
      trial_period_days: parseInt(price.trial_period_days) || null,
      metadata: JSON.parse(price.metadata || '{}')
    });
  }
  
  console.log(`✅ ${prices.length} prices migrated`);
}

async function migrateProducts() {
  const csv = fs.readFileSync('./products.csv', 'utf-8');
  const products = parse(csv, { columns: true });
  
  for (const product of products) {
    await db.collection('products').doc(product.id).set({
      active: product.active === 'true',
      name: product.name,
      description: product.description || null,
      image: product.image || null,
      metadata: JSON.parse(product.metadata || '{}')
    });
  }
  
  console.log(`✅ ${products.length} products migrated`);
}

async function migrateCustomers() {
  const csv = fs.readFileSync('./customers.csv', 'utf-8');
  const customers = parse(csv, { columns: true });
  
  for (const customer of customers) {
    await db.collection('customers').doc(customer.id).set({
      stripe_customer_id: customer.stripe_customer_id
    });
  }
  
  console.log(`✅ ${customers.length} customers migrated`);
}

async function main() {
  await migrateUsers();
  await migrateProducts();
  await migratePrices();
  await migrateCustomers();
  await migrateSubscriptions();
  console.log('✅ Migration complète !');
}

main().catch(console.error);
```

---

## Règles de sécurité Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      // Un utilisateur peut lire/écrire uniquement ses propres données
      allow read, update: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
    
    // Subscriptions collection
    match /subscriptions/{subscriptionId} {
      // Un utilisateur peut lire uniquement ses propres abonnements
      allow read: if request.auth != null && 
                     resource.data.user_id == request.auth.uid;
      // Seul le serveur (webhooks) peut écrire
      allow write: if false;
    }
    
    // Prices collection (lecture publique)
    match /prices/{priceId} {
      allow read: if true;
      allow write: if false;
    }
    
    // Products collection (lecture publique)
    match /products/{productId} {
      allow read: if true;
      allow write: if false;
    }
    
    // Customers collection (privée)
    match /customers/{customerId} {
      allow read: if request.auth != null && request.auth.uid == customerId;
      allow write: if false;
    }
    
    // Orders collection (déjà existante)
    match /orders/{orderId} {
      allow read: if request.auth != null && 
                     resource.data.customer.email == request.auth.token.email;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
    
    // Archives PDF (déjà existante)
    match /archives/pdf/{year}/{pdfId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

---

## Installation

### 1. Installer les dépendances Firebase Admin

```bash
npm install firebase-admin
```

### 2. Générer une clé de service Firebase

1. Aller dans [Firebase Console](https://console.firebase.google.com/)
2. Sélectionner le projet `lia-pdf`
3. Paramètres du projet → Comptes de service
4. Cliquer "Générer une nouvelle clé privée"
5. Télécharger le fichier JSON

### 3. Configurer les variables d'environnement

Extraire du fichier JSON téléchargé :
```json
{
  "project_id": "lia-pdf",
  "client_email": "firebase-adminsdk-xxxxx@lia-pdf.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
}
```

Ajouter dans `.env.local` :
```bash
FIREBASE_PROJECT_ID=lia-pdf
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@lia-pdf.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...-----END PRIVATE KEY-----\n"
```

### 4. Déployer les règles Firestore

```bash
firebase deploy --only firestore:rules
```

---

## Tests de migration

### Test 1: Authentification
```bash
# Se connecter avec un compte existant
# Vérifier que le token est stocké dans les cookies
# Vérifier que useAuth() retourne l'utilisateur
```

### Test 2: Abonnements
```bash
# Se connecter avec un compte abonné
# Vérifier que useSubscription() retourne l'abonnement
# Vérifier l'accès illimité aux PDFs
```

### Test 3: Achats individuels
```bash
# Se connecter avec un compte ayant acheté un PDF
# Vérifier que usePDFAccess() retourne true pour ce PDF
# Vérifier l'accès au lecteur PDF
```

### Test 4: Webhooks Stripe
```bash
# Tester un webhook subscription.created
# Vérifier que la collection subscriptions est mise à jour
# Vérifier que le statut de l'utilisateur change
```

---

## Rollback (en cas de problème)

### Option 1: Revenir à Supabase (Git)

```bash
# Revenir au commit avant la migration
git log --oneline  # Trouver le commit ID
git reset --hard <commit-id-avant-migration>
git push origin main --force

# Restaurer les variables d'environnement Supabase
```

### Option 2: Double système temporaire

Pendant la phase de transition, vous pouvez maintenir les deux systèmes :

1. Garder Supabase actif pour les utilisateurs existants
2. Utiliser Firebase pour les nouveaux utilisateurs
3. Migrer progressivement les utilisateurs

---

## Support

### Logs Firebase Admin
```bash
# Vérifier les logs dans Firebase Console
# Functions → Logs
```

### Debug hooks
```typescript
// Ajouter des console.log dans useAuth.ts
console.log('Firebase user:', user);
console.log('Firebase subscription:', subscription);
```

### Vérifier Firestore
```bash
# Firebase Console → Firestore Database
# Vérifier que les collections existent
# Vérifier les données des documents
```

---

**Date de migration**: 25 novembre 2025  
**Version**: 2.0.0 (Firebase)  
**Status**: ✅ Migration complète effectuée
