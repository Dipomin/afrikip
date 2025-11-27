# 🔧 Configuration Firebase Storage Rules

## ❌ Problème actuel
Les PDFs ne sont pas accessibles car Firebase Storage bloque l'accès avec l'erreur :
```
storage/unauthorized: User does not have permission to access 'archives/pdf/...'
```

## ✅ Solution : Option 2 - Lecture avec authentification (IMPLÉMENTÉE)

### Étape 1 : Accéder à Firebase Console
1. Aller sur https://console.firebase.google.com/u/3/project/lia-pdf/storage
2. Cliquer sur l'onglet **"Rules"** (Règles)

### Étape 2 : Configurer les règles d'authentification

Remplacer les règles actuelles par :

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Lecture réservée aux utilisateurs authentifiés (OPTION 2 - IMPLÉMENTÉE)
    match /archives/pdf/{year}/{document} {
      allow read: if request.auth != null; // Nécessite connexion
      allow write: if false; // Écriture désactivée (admin seulement via console)
    }
    
    // Autres chemins - accès restreint
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### Étape 3 : Activer Firebase Authentication

1. Dans Firebase Console, aller dans **Authentication**
2. Cliquer sur **"Get Started"**
3. Activer les méthodes de connexion :
   - ✅ **Email/Password** (obligatoire)
   - ✅ **Google** (recommandé)
4. Configurer les domaines autorisés :
   - `localhost` (dev)
   - `afrikipresse.fr` (production)
   - Votre domaine Vercel si applicable

### Étape 4 : Configurer Firestore Database

Créer la collection `users` avec les règles suivantes :

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Collection users - lecture/écriture par le propriétaire
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Collection archives/pdf - lecture publique, écriture admin
    match /archives/pdf/{year}/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### Étape 5 : Publier les règles
1. Cliquer sur **"Publish"** (Publier) pour chaque service
2. Attendre quelques secondes pour la propagation

## 🧪 Tester la configuration

### Test authentification :
```bash
# Les utilisateurs doivent se connecter via /connexion
# Puis accéder aux PDFs via /lintelligentpdf/list
```

Vous devriez voir :
- ✅ Page de connexion fonctionnelle
- ✅ Création de compte avec profil Firestore
- ✅ Accès aux PDFs après authentification
- ❌ Erreur 403 si non connecté

## 🔒 Sécurité - Option 2 Implémentée

**Avantages :**
- ✅ Contenu protégé et réservé aux abonnés
- ✅ Traçabilité des utilisateurs
- ✅ Possibilité de gérer les abonnements
- ✅ Meilleure monétisation du contenu

**Fonctionnalités :**
- Authentification Email/Password + Google
- Profils utilisateurs dans Firestore
- Système d'abonnement avec CinetPay
- Protection des PDFs par auth Firebase

## 📋 Structure Firestore

### Collection `users`
```javascript
{
  userId: {
    email: "user@example.com",
    nom: "Doe",
    prenom: "John",
    telephone: "+225XXXXXXXXX",
    ville: "Abidjan",
    pays: "Côte d'Ivoire",
    createdAt: Timestamp,
    subscriptionStatus: "active" | "inactive" | "expired",
    subscriptionType: "monthly" | "semiannual" | "annual" | null,
    subscriptionEndDate: Timestamp | null,
    pendingSubscription: {
      planId: "monthly",
      planName: "Mensuel",
      amount: 2000,
      duration: "1 mois",
      transactionId: "SUB-...",
      createdAt: Timestamp
    }
  }
}
```

## 🚨 Dépannage

### Erreur "auth/unauthorized-domain"
- Ajouter votre domaine dans Authentication > Settings > Authorized domains
- Pour localhost : déjà autorisé par défaut

### PDFs toujours bloqués après connexion
- Vérifier que `auth` est bien exporté dans `firebase.ts`
- S'assurer que `onAuthStateChanged` détecte l'utilisateur
- Vérifier les logs console : "User authenticated: true"

### Utilisateur non créé dans Firestore
- Vérifier les règles Firestore (lecture/écriture autorisée pour le userId)
- Consulter les logs console pour erreurs `setDoc()`
- S'assurer que le formulaire d'inscription appelle bien `setDoc()`

### Paiement CinetPay ne fonctionne pas
- Vérifier `.env` : `CINETPAY_KEY` et `CINETPAY_SITE_ID`
- Tester avec un petit montant (2000 F CFA)
- Consulter les logs API : `/api/cinetpay-m`
- Vérifier le webhook return_url
