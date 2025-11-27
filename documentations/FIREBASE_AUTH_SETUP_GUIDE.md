# Guide de configuration Firebase Authentication

## ⚠️ Erreur: `auth/configuration-not-found`

Cette erreur signifie que **Firebase Authentication n'est pas activé** dans votre projet Firebase.

## 🔧 Solution: Activer Firebase Authentication

### Étape 1: Accéder à la console Firebase

1. Allez sur [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Sélectionnez votre projet: **lia-pdf**

### Étape 2: Activer l'authentification par Email/Mot de passe

1. Dans le menu latéral gauche, cliquez sur **"Build"** → **"Authentication"**
2. Cliquez sur le bouton **"Get started"** (si première utilisation)
3. Allez dans l'onglet **"Sign-in method"**
4. Cliquez sur **"Email/Password"**
5. **Activez** l'option "Email/Password" (premier toggle)
6. Vous pouvez laisser "Email link (passwordless sign-in)" désactivé
7. Cliquez sur **"Save"**

### Étape 3: Activer la connexion Google (optionnel)

1. Toujours dans **"Sign-in method"**
2. Cliquez sur **"Google"**
3. **Activez** le provider Google
4. Sélectionnez un **email de support** (requis)
5. Cliquez sur **"Save"**

### Étape 4: Configurer les domaines autorisés

1. Dans **"Settings"** → **"Authorized domains"**
2. Assurez-vous que ces domaines sont autorisés:
   - `localhost` (pour développement)
   - `afrikipresse.fr` (pour production)
   - Votre domaine Vercel si applicable

### Étape 5: Vérifier la configuration

Une fois l'authentification activée:

1. Retournez sur votre site: `http://localhost:3000/connexion`
2. Essayez de créer un compte
3. L'erreur `auth/configuration-not-found` devrait disparaître

## 📋 Checklist de configuration

- [ ] Projet Firebase créé et configuré
- [ ] Authentication activée dans la console
- [ ] Méthode Email/Password activée
- [ ] Méthode Google activée (si souhaitée)
- [ ] Domaines autorisés configurés (localhost + production)
- [ ] Test de création de compte réussi
- [ ] Test de connexion réussi

## 🔐 Configuration Firestore (après Authentication)

### Règles de sécurité Firestore

Une fois Authentication activé, configurez les règles Firestore:

1. Allez dans **"Firestore Database"** → **"Rules"**
2. Remplacez les règles par:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Collection users - Lecture/écriture seulement pour l'utilisateur propriétaire
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Archives PDF - Lecture seulement si authentifié
    match /archives/pdf/{year}/{document=**} {
      allow read: if request.auth != null;
      allow write: if false; // Uniquement via admin
    }
  }
}
```

3. Cliquez sur **"Publish"**

### Règles de sécurité Firebase Storage

1. Allez dans **"Storage"** → **"Rules"**
2. Remplacez les règles par:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Archives PDF - Lecture seulement si authentifié
    match /archives/pdf/{year}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if false; // Uniquement via admin
    }
  }
}
```

3. Cliquez sur **"Publish"**

## 🧪 Test de la configuration

### Test 1: Création de compte

```bash
# Ouvrir la page d'inscription
http://localhost:3000/connexion
```

Remplir le formulaire:
- Email: `test@example.com`
- Mot de passe: `Test123456`
- Nom, prénom, etc.

**Résultat attendu**: ✅ Compte créé, redirection vers `/abonnement`

### Test 2: Connexion

Se déconnecter puis se reconnecter avec les mêmes identifiants.

**Résultat attendu**: ✅ Connexion réussie, redirection vers `/abonnement`

### Test 3: Connexion Google

Cliquer sur "Continuer avec Google"

**Résultat attendu**: ✅ Popup Google s'ouvre, après sélection du compte → redirection vers `/abonnement`

## ❌ Erreurs courantes

### `auth/configuration-not-found`
**Cause**: Authentication pas activé  
**Solution**: Suivre les étapes 1-2 ci-dessus

### `auth/unauthorized-domain`
**Cause**: Domaine non autorisé  
**Solution**: Ajouter le domaine dans "Authorized domains"

### `auth/popup-blocked`
**Cause**: Navigateur bloque les popups pour Google Sign-In  
**Solution**: Autoriser les popups pour localhost

### `auth/operation-not-allowed`
**Cause**: Méthode d'authentification pas activée  
**Solution**: Activer Email/Password ou Google dans "Sign-in method"

## 📞 Support

Si l'erreur persiste après avoir suivi ce guide:

1. Vérifiez la console du navigateur (F12) pour plus de détails
2. Vérifiez que `firebase.ts` contient la bonne configuration
3. Assurez-vous d'avoir la dernière version de `firebase` (v10+)
4. Vérifiez que le projet Firebase est bien **"lia-pdf"**

## 🎯 Prochaines étapes

Une fois l'authentification configurée:

1. ✅ Les utilisateurs peuvent créer un compte
2. ✅ Les utilisateurs peuvent se connecter
3. ✅ Les utilisateurs peuvent accéder à `/abonnement`
4. ✅ Les utilisateurs peuvent souscrire via CinetPay
5. ✅ Après paiement, accès aux PDFs protégés

---

**Configuration requise**: Firebase Console > lia-pdf > Authentication > Sign-in method > Email/Password (Enabled)
