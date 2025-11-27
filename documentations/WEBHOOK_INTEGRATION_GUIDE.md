# Guide d'intégration des Webhooks de Paiement

## 📋 Vue d'ensemble

Ce guide explique comment tester et utiliser les webhooks pour synchroniser automatiquement les abonnements CinetPay et Stripe avec la collection Firebase `subscriptions` affichée dans le dashboard admin.

## 🎯 Webhooks implémentés

### 1. **CinetPay Webhook** (`pages/api/subscription/webhook.ts`)

**URL de notification** : `https://afrikipresse.fr/api/subscription/webhook`

**Événements gérés** :
- ✅ Paiement accepté (ACCEPTED / 00)
- ❌ Paiement refusé (REFUSED)
- ⏳ Paiement en attente

**Actions effectuées** :
1. Vérifie la signature et le statut de la transaction auprès de CinetPay
2. Parse le `transaction_id` pour extraire `userId` et `plan`
3. Met à jour le document dans `users` collection
4. **NOUVEAU** : Crée un document dans `subscriptions` collection avec :
   ```typescript
   {
     userId: string,
     userEmail: string,
     status: "active",
     amount: number,
     interval: "month" | "semester" | "year",
     currency: "XOF",
     method: "cinetpay",
     cinetpayTransactionId: string,
     createdAt: Timestamp,
     currentPeriodStart: Timestamp,
     currentPeriodEnd: Timestamp,
     cancelAtPeriodEnd: false,
     canceledAt: null
   }
   ```

### 2. **Stripe Webhook** (`pages/api/webhooks/stripe.ts`)

**URL de webhook** : `https://afrikipresse.fr/api/webhooks/stripe`

**Événements gérés** :
- `customer.subscription.created` - Nouvel abonnement
- `customer.subscription.updated` - Modification d'abonnement
- `customer.subscription.deleted` - Annulation d'abonnement

**Actions effectuées** :
1. Vérifie la signature du webhook avec `STRIPE_WEBHOOK_SECRET`
2. Récupère les informations du customer Stripe
3. Trouve l'utilisateur Firebase correspondant via :
   - Champ `stripeCustomerId` dans la collection `users`
   - Métadonnées `userId` du customer Stripe
4. **Crée ou met à jour** un document dans `subscriptions` collection :
   ```typescript
   {
     userId: string,
     userEmail: string,
     status: "active" | "canceled" | "past_due" | "trialing" | "inactive",
     amount: number,
     interval: "month" | "year" | "semester",
     currency: "EUR",
     method: "stripe",
     stripeSubscriptionId: string,
     stripeCustomerId: string,
     stripePriceId: string,
     stripeProductId: string,
     createdAt: Timestamp,
     currentPeriodStart: Timestamp,
     currentPeriodEnd: Timestamp,
     cancelAtPeriodEnd: boolean,
     canceledAt: Timestamp | null
   }
   ```

## 🔧 Configuration

### Variables d'environnement requises

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...  # ⚠️ À configurer dans le dashboard Stripe

# CinetPay
CINETPAY_API_KEY=...
CINETPAY_SITE_ID=...

# Firebase (déjà configuré)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# etc.
```

### Configuration Stripe Dashboard

1. **Se connecter au Dashboard Stripe** : https://dashboard.stripe.com/
2. **Accéder aux Webhooks** : Developers → Webhooks
3. **Ajouter un endpoint** :
   - URL : `https://afrikipresse.fr/api/webhooks/stripe`
   - Événements à écouter :
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
4. **Récupérer le Signing Secret** et l'ajouter à `STRIPE_WEBHOOK_SECRET`

### Configuration CinetPay

Dans le dashboard CinetPay, configurer l'URL de notification :
- **URL** : `https://afrikipresse.fr/api/subscription/webhook`
- **Méthode** : POST

## 🧪 Tests

### Test CinetPay (Développement)

**Option 1 : Simulation manuelle**

```bash
# Envoyer une notification de test avec curl
curl -X POST http://localhost:3000/api/subscription/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "cpm_site_id": "VOTRE_SITE_ID",
    "cpm_trans_id": "SUB-MONTHLY-1234567890-userId123",
    "cpm_trans_date": "2024-01-15 10:30:00",
    "cpm_amount": "2000",
    "cpm_currency": "XOF",
    "cpm_payid": "PAY123456",
    "signature": "...",
    "payment_method": "MOBILE_MONEY",
    "cel_phone_num": "+225XXXXXXXX",
    "cpm_phone_prefixe": "225",
    "cpm_language": "fr",
    "cpm_version": "V2",
    "cpm_payment_config": "SINGLE",
    "cpm_page_action": "PAYMENT",
    "cpm_custom": "userId123",
    "cpm_designation": "Abonnement Mensuel",
    "cpm_error_message": ""
  }'
```

**Option 2 : Interface de paiement réelle**

1. Démarrer le serveur : `npm run dev`
2. Se connecter avec un compte test
3. Accéder à `/mobile-payment`
4. Choisir un plan et effectuer un paiement test
5. Vérifier dans Firebase Console que le document apparaît dans `subscriptions`

### Test Stripe (Stripe CLI)

**Installation de Stripe CLI** :

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Connexion
stripe login
```

**Forward des webhooks en local** :

```bash
# Démarrer le serveur Next.js
npm run dev

# Dans un autre terminal, forward les webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Stripe CLI affichera le `webhook signing secret` à utiliser pour les tests :
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

Ajouter ce secret dans `.env.local` :
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Déclencher des événements de test** :

```bash
# Créer un abonnement test
stripe trigger customer.subscription.created

# Mettre à jour un abonnement
stripe trigger customer.subscription.updated

# Supprimer un abonnement
stripe trigger customer.subscription.deleted
```

**Vérifier les logs** :
- Les logs du webhook apparaissent dans le terminal Next.js
- Vérifier dans Firebase Console : `subscriptions` collection
- Vérifier dans le dashboard admin : `/admin/subscriptions`

### Test avec des données réelles Stripe

**Créer un abonnement test complet** :

```bash
# 1. Créer un customer
stripe customers create \
  --email="test@afrikipresse.fr" \
  --metadata[userId]="userId123" \
  --description="Test Customer"

# 2. Créer une subscription
stripe subscriptions create \
  --customer=cus_xxxxx \
  --items[0][price]=price_xxxxx
```

## 📊 Vérification dans le Dashboard Admin

Après avoir déclenché des webhooks, vérifier :

1. **Page Dashboard** (`/admin`) :
   - Total Subscriptions doit augmenter
   - Monthly Revenue doit refléter les nouveaux paiements
   - MRR (Monthly Recurring Revenue) mis à jour
   - Recent Subscriptions affiche les 5 derniers avec badges "stripe" ou "cinetpay"

2. **Page Subscriptions** (`/admin/subscriptions`) :
   - Liste complète des abonnements
   - Filtres par statut (active, canceled, etc.)
   - Badges de méthode (Stripe, CinetPay)
   - Export CSV fonctionnel

## 🐛 Debugging

### Logs à surveiller

**CinetPay Webhook** :
```
🔔 Webhook CinetPay - Notification reçue
🔍 Vérification transaction: [transactionId]
📊 Statut transaction: {...}
✅ Paiement accepté - Activation abonnement
💾 Firestore - Activation abonnement
✅ Firestore - Abonnement activé dans users
✅ Firestore - Document subscription créé
```

**Stripe Webhook** :
```
🔔 Webhook Stripe reçu: {type, id}
📝 Traitement subscription: {id, status, customer}
✅ Nouvelle subscription créée: {docId, userId, status, amount}
✅ Document user mis à jour: userId
```

### Erreurs courantes

**Erreur : "Utilisateur introuvable"**
- Vérifier que le `userId` existe dans la collection `users`
- Pour CinetPay : Format du `transaction_id` doit être `SUB-{PLAN}-{timestamp}-{userId}`
- Pour Stripe : Vérifier que le customer a le champ `metadata.userId` ou que l'utilisateur a `stripeCustomerId`

**Erreur : "Signature invalide" (Stripe)**
- Vérifier que `STRIPE_WEBHOOK_SECRET` est correct
- Le secret change si vous supprimez/recréez l'endpoint webhook
- En local, utiliser le secret fourni par `stripe listen`

**Erreur : "Notification invalide" (CinetPay)**
- Vérifier les clés API CinetPay
- S'assurer que la notification vient bien de CinetPay (vérification IP possible)

## 🔐 Sécurité

### CinetPay
- ✅ Validation de la signature de notification
- ✅ Vérification de la transaction auprès de l'API CinetPay
- ✅ Pas d'exécution sans vérification réussie

### Stripe
- ✅ Vérification de la signature webhook avec `stripe.webhooks.constructEvent()`
- ✅ Validation du `STRIPE_WEBHOOK_SECRET`
- ✅ Logs détaillés pour audit

## 🚀 Déploiement en Production

### Checklist avant déploiement

- [ ] Variables d'environnement configurées (Vercel/autre)
- [ ] `STRIPE_WEBHOOK_SECRET` configuré avec le secret de production
- [ ] Endpoint webhook Stripe pointant vers `https://afrikipresse.fr/api/webhooks/stripe`
- [ ] URL de notification CinetPay pointant vers `https://afrikipresse.fr/api/subscription/webhook`
- [ ] Test avec un paiement réel de faible montant
- [ ] Vérification dans Firebase Console
- [ ] Vérification dans le dashboard admin
- [ ] Monitoring des logs activé (Vercel Logs / autre)

### Monitoring en production

**Stripe Dashboard** :
- Events → Webhooks : Vérifier les événements reçus et les réponses
- Logs : Voir les tentatives de webhook et les erreurs

**Firebase Console** :
- Vérifier que de nouveaux documents apparaissent dans `subscriptions`
- Vérifier les champs `stripeCustomerId` et `stripeSubscriptionId` dans `users`

**Vercel Logs** (ou logs de votre plateforme) :
- Surveiller les logs des API routes
- Filtrer par `/api/webhooks/stripe` et `/api/subscription/webhook`

## 📚 Ressources

- [Documentation Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Documentation CinetPay](https://cinetpay.com/documentation/api)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)

## 🎉 Prochaines étapes

Une fois les webhooks fonctionnels :

1. **Créer une page admin pour gérer manuellement les abonnements** (créer, annuler, modifier)
2. **Ajouter des notifications email** lors de l'activation/expiration d'abonnement
3. **Implémenter un système de renouvellement automatique** pour CinetPay
4. **Créer des rapports financiers avancés** (revenus par mois, taux de conversion, etc.)
5. **Ajouter des webhooks pour d'autres événements Stripe** (paiements échoués, cartes expirées, etc.)
