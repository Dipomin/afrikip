# 🚀 Guide de démarrage rapide - Système d'abonnement CinetPay

## ⚡ Configuration en 5 minutes

### 1️⃣ Variables d'environnement

Créez ou modifiez `.env.local`:

```bash
# CinetPay (récupérez ces valeurs sur https://cinetpay.com)
CINETPAY_KEY=your_apikey_here
CINETPAY_SITE_ID=your_site_id_here

# URL du site
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Dev
# NEXT_PUBLIC_SITE_URL=https://afrikipresse.fr  # Production
```

### 2️⃣ Installation des dépendances

```bash
npm install
# Toutes les dépendances sont déjà dans package.json
```

### 3️⃣ Configuration Firebase Authentication

Si ce n'est pas déjà fait, activez Authentication dans Firebase Console:
- Email/Password ✅
- Google Sign-In ✅ (optionnel)

### 4️⃣ Lancement

```bash
npm run dev
```

Accédez à: `http://localhost:3000/abonnement`

## 🧪 Test rapide

1. **Créer un compte** sur `/connexion`
2. **Aller sur** `/abonnement`
3. **Choisir un plan** et cliquer sur "S'abonner"
4. **Être redirigé** vers CinetPay
5. **Effectuer le paiement** (test)
6. **Vérifier l'activation** sur `/paiement/succes`

## 📁 Nouveaux fichiers créés

```
✅ lib/cinetpay.ts                       # Client CinetPay TypeScript
✅ lib/subscription-constants.ts         # Constantes centralisées
✅ pages/api/subscription/init.ts        # API initialisation paiement
✅ pages/api/subscription/webhook.ts     # API webhook CinetPay
✅ pages/api/subscription/status.ts      # API vérification statut
✅ pages/abonnement/index.tsx            # Page mise à jour
✅ SUBSCRIPTION_API_DOCUMENTATION.md     # Documentation complète
✅ QUICK_START.md                        # Ce guide
```

## 🔑 Endpoints API

### Initialiser un paiement
```bash
POST /api/subscription/init
```

### Webhook (configuré sur CinetPay)
```bash
POST /api/subscription/webhook
```

### Vérifier un abonnement
```bash
GET /api/subscription/status?userId=USER_ID
```

## 🎯 Configuration CinetPay Dashboard

1. Connectez-vous à [CinetPay](https://cinetpay.com)
2. Menu **Intégration** → Copiez `apikey` et `site_id`
3. Menu **Services** → Configurez votre service:
   - **Notify URL**: `https://afrikipresse.fr/api/subscription/webhook`
   - **Return URL**: `https://afrikipresse.fr/paiement/succes`
4. Menu **Services** → **Identifier le service** (important !)

## 💡 Points importants

### ✅ Montants valides
Les montants CinetPay doivent être des **multiples de 5**:
- ✅ 2000, 6500, 13000 F CFA (configurés)
- ❌ 1999, 6501 (invalides)

### ✅ Codes pays
Utilisez les **codes ISO à 2 lettres**:
- CI (Côte d'Ivoire)
- SN (Sénégal)
- TG (Togo)
- BJ (Bénin)
- etc.

### ✅ Format transaction_id
```
SUB-{PLAN}-{TIMESTAMP}-{USER_ID_8_CHARS}
Exemple: SUB-MONTHLY-1732450000000-a1b2c3d4
```

## 🐛 Résolution rapide des problèmes

### Erreur: "credentials missing"
```bash
# Vérifiez que .env.local contient:
CINETPAY_KEY=...
CINETPAY_SITE_ID=...
```

### Erreur: "auth/configuration-not-found"
```bash
# Activez Firebase Authentication:
Firebase Console > Authentication > Sign-in method > Email/Password
```

### Paiement non activé
```bash
# Vérifiez les logs webhook:
vercel logs --follow

# Vérifiez Firestore:
Firebase Console > Firestore > users > {userId}
```

### Webhook pas appelé
```bash
# Vérifiez CinetPay Dashboard:
1. Service "identifié" ✅
2. Notify URL correcte
3. Pas de localhost (utilisez ngrok en dev)
```

## 📊 Vérification manuelle

### Vérifier un abonnement via API
```bash
curl "http://localhost:3000/api/subscription/status?userId=YOUR_USER_ID"
```

### Vérifier Firestore
```
Firebase Console > Firestore > users > {userId}
Vérifiez les champs:
- subscriptionStatus: "active"
- subscriptionEndDate: Date future
- subscriptionType: "monthly|semiannual|annual"
```

## 🔄 Migration depuis l'ancien système

Si vous aviez les anciennes routes `/api/cinetpay-{m,s,a}`:

1. ✅ Le nouveau système est **compatible**
2. ✅ Toutes les routes utilisent maintenant `/api/subscription/init`
3. ⚠️ Vous pouvez supprimer les anciennes routes après validation

## 📞 Besoin d'aide ?

### Documentation complète
Voir `SUBSCRIPTION_API_DOCUMENTATION.md` pour:
- Architecture détaillée
- Tous les endpoints
- Structure Firestore complète
- Codes d'erreur
- Tests avancés

### Logs de debugging
Tous les logs utilisent des emojis pour faciliter la lecture:
- 🚀 Initialisation
- ✅ Succès
- ❌ Erreur
- 🔍 Vérification
- 💾 Sauvegarde Firestore

### Support CinetPay
- Documentation: https://docs.cinetpay.com
- Dashboard: https://cinetpay.com
- Support: contact@cinetpay.com

## ✨ Fonctionnalités implémentées

✅ **Paiement Mobile Money**: Orange, MTN, Moov, Wave  
✅ **Paiement par carte**: Visa, Mastercard  
✅ **3 plans d'abonnement**: Mensuel, Semestriel, Annuel  
✅ **Activation automatique**: Via webhook après paiement  
✅ **Vérification de statut**: API dédiée  
✅ **Gestion des erreurs**: Messages détaillés  
✅ **Types TypeScript**: 100% typé  
✅ **Logs structurés**: Debugging facile  
✅ **Sécurité**: Validation à tous les niveaux  

## 🎉 C'est tout !

Votre système d'abonnement est prêt à fonctionner !

---

**Version**: 1.0  
**Dernière mise à jour**: 24 novembre 2024
