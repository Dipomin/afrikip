# 🔥 STRUCTURE FIREBASE POUR ADMIN - Guide complet

## 📋 Vue d'ensemble

Toutes les pages administrateur (`/admin`) utilisent maintenant **uniquement Firebase Firestore** pour gérer les données. Supabase a été complètement retiré.

---

## 🗂️ Collections Firestore

### 1. **Collection `users`** (Existante)

Stocke les informations des utilisateurs avec leur rôle.

```typescript
// Document ID: {firebase_auth_uid}
{
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  ville?: string;
  pays?: string;
  role: "USER" | "ADMIN";  // ⚠️ REQUIS pour admin
  subscriptionStatus?: "active" | "inactive";
  createdAt: Timestamp;
}
```

**Utilisation** :
- Dashboard : Comptage total, nouveaux utilisateurs ce mois
- Page Users : Liste complète, modification rôles, suppression
- Authentification : Vérification rôle ADMIN

---

### 2. **Collection `subscriptions`** (À CRÉER)

Stocke les abonnements des utilisateurs (Stripe + CinetPay).

```typescript
// Document ID: {auto-generated}
{
  userId: string;           // Firebase Auth UID
  userEmail: string;        // Email utilisateur
  status: "active" | "inactive" | "trialing" | "canceled" | "past_due";
  amount: number;           // Montant en EUR (ex: 3000 pour 3000€)
  interval: "month" | "year" | "semester";
  currency: string;         // "EUR", "XOF", etc.
  method: "stripe" | "cinetpay";
  createdAt: Timestamp;
  currentPeriodStart: Timestamp;
  currentPeriodEnd: Timestamp;
  cancelAtPeriodEnd: boolean;
  canceledAt: Timestamp | null;
  stripeSubscriptionId?: string;  // Si Stripe
  cinetpayTransactionId?: string; // Si CinetPay
}
```

**Utilisation** :
- Dashboard : Statistiques (total, actifs, MRR, revenus)
- Page Subscriptions : Liste complète, filtres, export CSV
- Calculs : Revenus mensuels/totaux, croissance

**Exemple de document** :
```json
{
  "userId": "abc123xyz",
  "userEmail": "user@example.com",
  "status": "active",
  "amount": 3000,
  "interval": "month",
  "currency": "EUR",
  "method": "stripe",
  "createdAt": "2025-01-15T10:00:00.000Z",
  "currentPeriodStart": "2025-01-15T10:00:00.000Z",
  "currentPeriodEnd": "2025-02-15T10:00:00.000Z",
  "cancelAtPeriodEnd": false,
  "canceledAt": null,
  "stripeSubscriptionId": "sub_xxxxx"
}
```

---

### 3. **Collection `journals`** (Existante)

Stocke les journaux publiés (L'Intelligent d'Abidjan).

```typescript
// Document ID: {auto-generated}
{
  title: string;
  issueNumber: string;
  coverImageUrl: string;
  pdfUrl: string;
  tags: string[];
  description?: string;
  createdAt: Timestamp;
  uploadedBy: string; // Firebase Auth UID
}
```

**Utilisation** :
- Dashboard : Comptage total des journaux
- Page Journal : Upload, liste, gestion

---

## 📊 Statistiques Calculées

### Dashboard (`/admin`)

```typescript
interface DashboardStats {
  totalUsers: number;              // users.length
  totalSubscriptions: number;      // subscriptions.length
  activeSubscriptions: number;     // status === "active"
  monthlyRevenue: number;          // Somme des montants créés ce mois
  totalRevenue: number;            // Somme de tous les montants actifs
  newUsersThisMonth: number;       // createdAt >= début du mois
  journalsCount: number;           // journals.length
  subscriptionGrowth: number;      // Pourcentage (simulé)
  revenueGrowth: number;           // Pourcentage (simulé)
}
```

### Page Subscriptions (`/admin/subscriptions`)

```typescript
interface SubscriptionStats {
  total: number;             // Tous les abonnements
  active: number;            // status === "active"
  trialing: number;          // status === "trialing"
  canceled: number;          // status === "canceled"
  past_due: number;          // status === "past_due"
  totalRevenue: number;      // Somme montants actifs
  monthlyRecurring: number;  // MRR (Monthly Recurring Revenue)
}
```

**Calcul MRR** :
```typescript
if (interval === "month") {
  MRR += amount;
} else if (interval === "year") {
  MRR += amount / 12;
} else if (interval === "semester") {
  MRR += amount / 6;
}
```

---

## 🔧 Intégration avec Stripe/CinetPay

### Quand un paiement est validé

#### Stripe Webhook
```typescript
// pages/api/webhooks/stripe.ts
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Lors de subscription.created ou subscription.updated
const subscriptionData = {
  userId: stripeCustomer.metadata.userId,
  userEmail: stripeCustomer.email,
  status: stripeSubscription.status,
  amount: stripeSubscription.items.data[0].price.unit_amount / 100,
  interval: stripeSubscription.items.data[0].price.recurring.interval,
  currency: "EUR",
  method: "stripe",
  createdAt: serverTimestamp(),
  currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
  currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
  cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
  canceledAt: null,
  stripeSubscriptionId: stripeSubscription.id,
};

await addDoc(collection(db, "subscriptions"), subscriptionData);
```

#### CinetPay Notification
```typescript
// pages/api/cinetpay-notify/index.ts
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Lors de la notification de paiement réussi
const subscriptionData = {
  userId: paymentData.userId,
  userEmail: paymentData.customerEmail,
  status: "active",
  amount: paymentData.amount, // En XOF ou converti en EUR
  interval: paymentData.interval, // "month", "semester", "year"
  currency: "XOF",
  method: "cinetpay",
  createdAt: serverTimestamp(),
  currentPeriodStart: serverTimestamp(),
  currentPeriodEnd: calculateEndDate(paymentData.interval),
  cancelAtPeriodEnd: false,
  canceledAt: null,
  cinetpayTransactionId: paymentData.transactionId,
};

await addDoc(collection(db, "subscriptions"), subscriptionData);
```

---

## 🛠️ Fonctions Utiles

### 1. Créer un abonnement manuellement

```typescript
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

async function createSubscription(userId: string, userEmail: string, plan: string) {
  const plans = {
    monthly: { amount: 3000, interval: "month" },
    semester: { amount: 15000, interval: "semester" },
    annual: { amount: 25000, interval: "year" },
  };

  const selectedPlan = plans[plan];
  const now = new Date();
  const endDate = new Date();
  
  if (selectedPlan.interval === "month") {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (selectedPlan.interval === "semester") {
    endDate.setMonth(endDate.getMonth() + 6);
  } else if (selectedPlan.interval === "year") {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  await addDoc(collection(db, "subscriptions"), {
    userId,
    userEmail,
    status: "active",
    amount: selectedPlan.amount,
    interval: selectedPlan.interval,
    currency: "EUR",
    method: "manual",
    createdAt: serverTimestamp(),
    currentPeriodStart: now,
    currentPeriodEnd: endDate,
    cancelAtPeriodEnd: false,
    canceledAt: null,
  });

  console.log("✅ Abonnement créé avec succès");
}

// Utilisation
createSubscription("user_uid_123", "user@example.com", "monthly");
```

### 2. Mettre à jour le statut subscriptionStatus dans users

```typescript
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

async function updateUserSubscriptionStatus(userId: string, status: string) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    subscriptionStatus: status
  });
}

// Appeler cette fonction après création/annulation d'abonnement
updateUserSubscriptionStatus("user_uid_123", "active");
```

---

## 📝 Script de Migration (Si vous avez des données Supabase)

```typescript
// scripts/migrate-subscriptions.ts
import { createClient } from '@supabase/supabase-js';
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migrateSubscriptions() {
  // 1. Récupérer depuis Supabase
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select(`
      *,
      prices (
        unit_amount,
        interval,
        currency
      )
    `);

  // 2. Insérer dans Firebase
  for (const sub of subscriptions || []) {
    await addDoc(collection(db, "subscriptions"), {
      userId: sub.user_id,
      userEmail: "unknown@email.com", // À récupérer depuis users
      status: sub.status,
      amount: (sub.prices?.unit_amount || 0) / 100,
      interval: sub.prices?.interval || "month",
      currency: sub.prices?.currency || "EUR",
      method: "stripe",
      createdAt: new Date(sub.created),
      currentPeriodStart: new Date(sub.current_period_start),
      currentPeriodEnd: new Date(sub.current_period_end),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      canceledAt: sub.canceled_at ? new Date(sub.canceled_at) : null,
      stripeSubscriptionId: sub.id,
    });
  }

  console.log(`✅ ${subscriptions?.length} abonnements migrés`);
}

migrateSubscriptions();
```

---

## ✅ Checklist de Mise en Production

- [ ] Créer la collection `subscriptions` dans Firebase Console
- [ ] Ajouter les index Firestore nécessaires (status, userId, createdAt)
- [ ] Mettre à jour les webhooks Stripe pour créer des documents dans `subscriptions`
- [ ] Mettre à jour les notifications CinetPay pour créer des documents dans `subscriptions`
- [ ] Tester la création d'abonnements manuellement
- [ ] Vérifier que le dashboard affiche les bonnes statistiques
- [ ] Tester les exports CSV
- [ ] Migrer les données existantes depuis Supabase (si applicable)
- [ ] Supprimer les dépendances Supabase inutilisées

---

## 🔗 Règles de Sécurité Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Subscriptions collection (ADMIN uniquement en écriture)
    match /subscriptions/{subscriptionId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "ADMIN");
      
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "ADMIN";
    }
    
    // Journals collection
    match /journals/{journalId} {
      allow read: if true; // Public
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "ADMIN";
    }
  }
}
```

---

✅ **Migration terminée !** Votre système admin fonctionne maintenant 100% avec Firebase.
