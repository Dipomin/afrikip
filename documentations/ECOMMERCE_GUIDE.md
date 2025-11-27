# Système E-Commerce pour L'Intelligent d'Abidjan

## 📋 Vue d'ensemble

Système complet d'achat de journaux PDF individuels avec paiement CinetPay (Mobile Money XOF).

**Tarif**: 200 F CFA par journal PDF

## 🏗️ Architecture

### Frontend
- **CartContext** (`contexts/CartContext.tsx`): Gestion globale du panier avec localStorage
- **Cart** (`components/Cart.tsx`): Drawer latéral moderne avec récapitulatif
- **JournalCard** (`components/JournalCard.tsx`): Bouton d'achat intégré
- **Checkout** (`pages/checkout.tsx`): Formulaire client + récapitulatif commande
- **OrderSuccess** (`pages/order-success.tsx`): Page de confirmation avec téléchargements

### Backend (API Routes)
- **`/api/cinetpay-pdf-purchase`**: Crée commande Firestore + initie paiement CinetPay
- **`/api/cinetpay-pdf-notify`**: Webhook CinetPay pour confirmation paiement

### Base de données (Firestore)
Collection: `orders`

Structure d'un document:
```typescript
{
  transactionId: string,          // "PDF-1234567890-abc123"
  customer: {
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    city?: string,
    country: string
  },
  items: Array<{
    id: string,                   // ID du journal
    title: string,
    issueNumber: string,
    coverImageURL: string,
    pdfURL: string,
    price: number,                // 200
    year: string
  }>,
  total: number,                  // Total en XOF
  status: "pending" | "paid" | "failed",
  paymentMethod: "cinetpay",
  paymentStatus?: string,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  paidAt?: Timestamp,
  cinetpayData?: {
    payment_method: string,
    operator_id: string,
    payment_date: string
  }
}
```

## 🔐 Règles Firestore

Ajoutez ces règles dans Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Collection orders
    match /orders/{orderId} {
      // Lecture: Personne ne peut lire directement (seulement via backend)
      allow read: if false;
      
      // Écriture: Seulement via backend (API routes)
      allow create: if false;
      allow update: if false;
      allow delete: if false;
    }
  }
}
```

**Note**: Les commandes sont gérées uniquement côté serveur (API routes) pour sécurité maximale.

## 🚀 Flux utilisateur

1. **Navigation**: Utilisateur parcourt les journaux sur `/lintelligentpdf/aujourdhui`
2. **Ajout panier**: Clic sur "Acheter - 200 F CFA" → Article ajouté au panier
3. **Panier**: Clic sur bouton flottant (coin inférieur droit) → Drawer s'ouvre
4. **Checkout**: Clic "Passer la commande" → Redirection `/checkout`
5. **Formulaire**: Remplir infos (nom, email, téléphone, ville, pays)
6. **Paiement**: Clic "Payer X F CFA" → Création commande + redirection CinetPay
7. **Mobile Money**: Utilisateur paie via Orange Money, MTN, Moov, Wave, etc.
8. **Callback**: CinetPay notifie `/api/cinetpay-pdf-notify` → Mise à jour statut
9. **Confirmation**: Redirection `/order-success?orderId=xxx&transactionId=xxx`
10. **Téléchargement**: Accès immédiat aux PDFs achetés

## 🎨 Features

### Panier (Cart)
- ✅ Ajout/retrait d'articles
- ✅ Persistance localStorage
- ✅ Animation slide-in
- ✅ Compteur badge animé
- ✅ Design moderne gradient
- ✅ Vider panier
- ✅ Responsive mobile

### Checkout
- ✅ Formulaire en 3 sections (Perso, Coordonnées, Localisation)
- ✅ Validation côté client
- ✅ Récapitulatif sticky (desktop)
- ✅ Messages d'erreur clairs
- ✅ Loading state pendant création commande
- ✅ Support pays UEMOA (Côte d'Ivoire, Sénégal, Mali, etc.)

### Page Success
- ✅ Affichage statut paiement (réussi/attente/échoué)
- ✅ Détails commande complets
- ✅ Boutons téléchargement PDF (si payé)
- ✅ Bouton actualiser statut
- ✅ Imprimer reçu
- ✅ Design conditionnel selon statut

### Sécurité
- ✅ Validation serveur CinetPay (webhook)
- ✅ Firestore rules strictes
- ✅ Pas d'accès direct base de données depuis client
- ✅ Transaction IDs uniques
- ✅ Vérification double (notify + check API)

## 📱 Variables d'environnement

Ajoutez dans `.env.local`:

```bash
# CinetPay (déjà existant pour abonnements)
CINETPAY_KEY=your_cinetpay_api_key
CINETPAY_SITE_ID=your_site_id

# Site URL
NEXT_PUBLIC_SITE_URL=https://afrikipresse.fr
# ou en dev: http://localhost:3000
```

## 🔧 Configuration CinetPay

### URLs de notification
Dans votre dashboard CinetPay, configurez:

- **Notify URL**: `https://afrikipresse.fr/api/cinetpay-pdf-notify`
- **Return URL**: Géré dynamiquement par le code

### Canaux de paiement
- ✅ Mobile Money (Orange, MTN, Moov, Wave)
- ✅ Carte bancaire (optionnel)

## 🎯 Prochaines améliorations possibles

1. **Email automatique**: Envoyer PDFs par email après paiement
2. **Historique achats**: Page `/my-orders` pour voir ses commandes
3. **Codes promo**: System de réduction
4. **Packs**: Offres groupées (ex: 5 journaux pour 800 F CFA)
5. **Abonnement**: Accès illimité mensuel/annuel
6. **Partage**: Offrir un journal à quelqu'un
7. **Wishlist**: Liste de souhaits
8. **Recommandations**: "Vous aimerez aussi..."

## 📊 Analytics

Événements à tracker:
- `add_to_cart` - Ajout au panier
- `begin_checkout` - Début checkout
- `purchase` - Achat complété
- `pdf_download` - Téléchargement PDF

## 🐛 Debugging

### Logs serveur
```bash
# Dans /api/cinetpay-pdf-purchase
✅ Commande créée: orderID
📤 Envoi requête CinetPay: {...}
📥 Réponse CinetPay: {...}

# Dans /api/cinetpay-pdf-notify
🔔 Notification CinetPay reçue: {...}
🔍 Vérification CinetPay: {...}
✅ Commande marquée comme payée: orderID
```

### Console client
```bash
# Dans pdfViewer (si utilisé)
🔗 Génération URL signée Firebase: path
✅ URL signée générée
📥 Téléchargement du PDF...
✅ PDF téléchargé: X.XX MB
```

## 🎨 Design System

### Couleurs
- **Primary**: Gradient `from-blue-600 to-red-600`
- **Success**: `green-600`
- **Warning**: `yellow-600`
- **Error**: `red-600`

### Composants shadcn/ui utilisés
- Button (variant: outline, ghost)
- Input, Select
- Drawer pattern custom

## 📝 Notes importantes

1. **Prix fixe**: 200 F CFA par PDF (modifiable dans `JournalCard.tsx` → `JOURNAL_PRICE`)
2. **Panier persistant**: Survit au rechargement page (localStorage)
3. **Bouton flottant**: Toujours visible (z-index 9997)
4. **No duplicates**: Un même journal ne peut être ajouté qu'une fois
5. **CORS Firebase**: Configuré via gsutil (voir conversation précédente)

## 🚀 Déploiement

1. Ajouter variables env sur Vercel
2. Déployer règles Firestore via Console
3. Configurer webhooks CinetPay
4. Tester en mode sandbox
5. Passer en production

---

**Créé le**: 25 novembre 2025
**Version**: 1.0.0
**Status**: ✅ Prêt pour production
