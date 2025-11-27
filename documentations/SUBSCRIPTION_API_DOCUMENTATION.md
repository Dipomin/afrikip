# Système d'abonnement moderne - API CinetPay

## 🎯 Vue d'ensemble

Nouveau système d'abonnement professionnel intégré avec CinetPay pour gérer les paiements Mobile Money et cartes bancaires pour l'accès au journal numérique Afrikipresse.

## 📋 Architecture

### Structure des fichiers

```
lib/
  └── cinetpay.ts                    # Client CinetPay avec types TypeScript complets

pages/
  └── api/
      └── subscription/
          ├── init.ts                # Initialisation des paiements
          ├── webhook.ts             # Notifications CinetPay
          └── status.ts              # Vérification statut abonnement
  
  └── abonnement/
      └── index.tsx                  # Page d'abonnement (mise à jour)
```

## 🔧 Configuration requise

### Variables d'environnement

```bash
# CinetPay (OBLIGATOIRE)
CINETPAY_KEY=votre_apikey_cinetpay
CINETPAY_SITE_ID=votre_site_id_cinetpay

# Site URL (pour webhooks)
NEXT_PUBLIC_SITE_URL=https://afrikipresse.fr  # Production
# OU pour dev local:
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Configuration CinetPay Dashboard

1. **Connectez-vous** à [https://cinetpay.com](https://cinetpay.com)
2. **Menu Intégration** → Récupérez:
   - `apikey` (CINETPAY_KEY)
   - `site_id` (CINETPAY_SITE_ID)

3. **Configurer les URLs de notification**:
   - Notify URL: `https://afrikipresse.fr/api/subscription/webhook`
   - Return URL: `https://afrikipresse.fr/paiement/succes`

## 💰 Plans d'abonnement

| Plan | ID | Prix | Durée | Économies |
|------|-----|------|-------|-----------|
| **Mensuel** | `monthly` | 2 000 F CFA | 30 jours | - |
| **Semestriel** | `semiannual` | 6 500 F CFA | 180 jours | 5 500 F CFA |
| **Annuel** | `annual` | 13 000 F CFA | 365 jours | 11 000 F CFA |

## 🚀 Flux de paiement

### 1. Initialisation du paiement

**Endpoint**: `POST /api/subscription/init`

**Requête**:
```typescript
{
  "plan": "monthly" | "semiannual" | "annual",
  "userId": "firebase_user_id",
  "customer": {
    "customer_name": "DOE",
    "customer_surname": "John",
    "customer_email": "john.doe@example.com",
    "customer_phone_number": "+2250704315545",
    "customer_address": "Cocody",
    "customer_city": "Abidjan",
    "customer_country": "CI",  // Code ISO 2 lettres
    "customer_state": "AB",
    "customer_zip_code": "00225"
  },
  "metadata": {
    "userEmail": "john.doe@example.com",
    "userName": "John DOE"
  }
}
```

**Réponse succès**:
```json
{
  "success": true,
  "payment_url": "https://checkout.cinetpay.com/payment/xxxxx",
  "transaction_id": "SUB-MONTHLY-1732450000000-a1b2c3d4",
  "message": "Paiement initialisé avec succès"
}
```

**Réponse erreur**:
```json
{
  "success": false,
  "error": "Description de l'erreur",
  "message": "Message d'erreur détaillé"
}
```

### 2. Redirection vers CinetPay

L'utilisateur est redirigé vers `payment_url` où il peut payer avec:
- 📱 **Mobile Money**: Orange Money, MTN, Moov Money, Wave
- 💳 **Cartes bancaires**: Visa, Mastercard (locales et internationales)

### 3. Notification webhook (automatique)

CinetPay envoie une notification POST à `/api/subscription/webhook` après le paiement.

**Données reçues**:
```typescript
{
  cpm_site_id: string;
  cpm_trans_id: string;        // ID transaction
  cpm_amount: string;          // Montant
  cpm_trans_status: string;    // "ACCEPTED" ou "REFUSED"
  cpm_result: string;          // "00" = succès
  // ... autres champs
}
```

**Actions du webhook**:
1. ✅ Valide la notification (site_id, signature)
2. ✅ Vérifie la transaction auprès de CinetPay
3. ✅ Parse le `transaction_id` pour extraire `userId` et `plan`
4. ✅ Active l'abonnement dans Firestore si paiement accepté
5. ✅ Enregistre l'échec si paiement refusé

### 4. Page de confirmation

L'utilisateur est redirigé vers `/paiement/succes` avec:
- `plan`: Type d'abonnement
- `transaction_id`: ID de la transaction

La page vérifie automatiquement l'activation de l'abonnement.

## 📊 Structure Firestore

### Collection `users/{userId}`

Après activation d'un abonnement:

```typescript
{
  // Données utilisateur existantes
  email: "john.doe@example.com",
  nom: "DOE",
  prenom: "John",
  
  // Abonnement (ajouté/mis à jour)
  subscriptionStatus: "active" | "inactive" | "expired",
  subscriptionType: "monthly" | "semiannual" | "annual",
  subscriptionStartDate: Timestamp,
  subscriptionEndDate: Timestamp,
  lastPaymentAmount: 2000,
  lastPaymentDate: Timestamp,
  lastTransactionId: "SUB-MONTHLY-1732450000000-a1b2c3d4",
  
  // Transaction en cours (avant paiement)
  pendingSubscription: {
    planId: "monthly",
    planName: "Mensuel",
    amount: 2000,
    duration: "1 mois",
    transactionId: "SUB-MONTHLY-1732450000000-a1b2c3d4",
    createdAt: Timestamp
  } | null,
  
  // Échecs de paiement (si applicable)
  lastFailedPayment: {
    transactionId: string,
    reason: string,
    date: Timestamp
  },
  
  updatedAt: Timestamp
}
```

## 🔐 Sécurité

### Validation des requêtes

✅ **Client CinetPay** (`lib/cinetpay.ts`):
- Validation des montants (multiple de 5)
- Nettoyage des caractères spéciaux
- Types TypeScript stricts
- Timeout de 30 secondes
- Gestion complète des erreurs

✅ **API d'initialisation** (`init.ts`):
- Validation du plan d'abonnement
- Validation des données client (email, code pays)
- Vérification userId
- Headers User-Agent requis

✅ **Webhook** (`webhook.ts`):
- Validation site_id
- Vérification de la transaction auprès de CinetPay
- Double vérification du statut
- Logs détaillés

### Codes ISO pays supportés

| Pays | Code |
|------|------|
| Côte d'Ivoire | CI |
| Sénégal | SN |
| Togo | TG |
| Bénin | BJ |
| Mali | ML |
| Burkina Faso | BF |
| Cameroun | CM |
| Congo | CG |

## 🧪 Tests

### 1. Test en local (développement)

```bash
# 1. Démarrer le serveur
npm run dev

# 2. Aller sur la page d'abonnement
http://localhost:3000/abonnement

# 3. Se connecter avec un compte test

# 4. Sélectionner un plan et tester le paiement
```

**Note**: En développement, configurez:
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Test du webhook

Utilisez [webhook.site](https://webhook.site) pour tester:

1. Créez une URL webhook temporaire
2. Mettez à jour `notify_url` dans le code temporairement
3. Effectuez un paiement test
4. Vérifiez les données reçues

### 3. Vérification du statut

```bash
# API de vérification
curl -X GET "http://localhost:3000/api/subscription/status?userId=USER_ID"
```

**Réponse abonnement actif**:
```json
{
  "success": true,
  "isActive": true,
  "subscription": {
    "status": "active",
    "type": "monthly",
    "startDate": "2024-11-24T10:00:00.000Z",
    "endDate": "2024-12-24T10:00:00.000Z",
    "daysRemaining": 30
  },
  "message": "Abonnement actif"
}
```

## 📱 Intégration frontend

### Page d'abonnement

```typescript
// pages/abonnement/index.tsx
const handleSubscribe = async (plan: SubscriptionPlan) => {
  const response = await axios.post("/api/subscription/init", {
    plan: plan.id,
    userId: user.uid,
    customer: { /* ... */ },
    metadata: { /* ... */ }
  });
  
  if (response.data.success) {
    // Rediriger vers CinetPay
    window.location.href = response.data.payment_url;
  }
};
```

### Vérification de l'accès

```typescript
// Vérifier si l'utilisateur a un abonnement actif
const checkSubscription = async (userId: string) => {
  const response = await axios.get(`/api/subscription/status?userId=${userId}`);
  return response.data.isActive;
};
```

## 🐛 Debugging

### Logs disponibles

Tous les endpoints loguent avec des emojis pour faciliter le debugging:

```
🚀 Initialisation
✅ Succès
❌ Erreur
🔍 Vérification
💾 Sauvegarde Firestore
📊 Statut
🔔 Webhook reçu
⏰ Expiration
```

### Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `credentials missing` | Variables d'env absentes | Vérifier `.env.local` |
| `multiple de 5` | Montant invalide | Utiliser 2000, 6500, 13000 |
| `Notification invalide` | site_id incorrect | Vérifier CINETPAY_SITE_ID |
| `Transaction non vérifiable` | ID invalide | Vérifier format transaction_id |
| `Utilisateur introuvable` | userId invalide | Vérifier Firebase Auth |

### Vérification manuelle

```bash
# 1. Vérifier les logs Vercel
vercel logs

# 2. Vérifier Firestore
# Console Firebase > Firestore > users > {userId}

# 3. Vérifier CinetPay Dashboard
# Transactions > Rechercher transaction_id
```

## 🔄 Migration depuis l'ancien système

### Changements principaux

1. ✅ **API unifiée**: Un seul endpoint `/api/subscription/init` au lieu de 3 (`cinetpay-m`, `cinetpay-s`, `cinetpay-a`)
2. ✅ **Client TypeScript**: Types complets et validation stricte
3. ✅ **Meilleure gestion d'erreurs**: Messages détaillés et logs structurés
4. ✅ **Webhook amélioré**: Double vérification et activation automatique
5. ✅ **Sécurité renforcée**: Validation à tous les niveaux

### Étapes de migration

1. ✅ Créer `lib/cinetpay.ts`
2. ✅ Créer les 3 nouvelles API routes
3. ✅ Mettre à jour `pages/abonnement/index.tsx`
4. ✅ Configurer les variables d'environnement
5. ✅ Tester le flux complet
6. ⚠️ Supprimer les anciennes routes (`cinetpay-m`, `cinetpay-s`, `cinetpay-a`) après validation

## 📞 Support

### Documentation CinetPay
- API: https://docs.cinetpay.com/api/1.0-fr/checkout/initialisation
- Dashboard: https://cinetpay.com

### Logs de production
```bash
# Vercel
vercel logs --follow

# Firebase Console
https://console.firebase.google.com/project/lia-pdf/firestore
```

## ✅ Checklist de déploiement

- [ ] Variables d'environnement configurées sur Vercel
- [ ] URLs de webhook configurées sur CinetPay Dashboard
- [ ] Règles Firestore mises à jour (accès users collection)
- [ ] Test paiement en production
- [ ] Vérification activation automatique
- [ ] Test expiration d'abonnement
- [ ] Monitoring des logs activé

---

**Version**: 2.0  
**Date**: 24 novembre 2024  
**Auteur**: Système d'abonnement Afrikipresse
