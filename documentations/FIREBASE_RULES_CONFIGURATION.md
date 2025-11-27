# Configuration Firebase - Règles de sécurité pour le système de journaux

## 🔐 Problème résolu

L'erreur **"Missing or insufficient permissions"** survient lorsque les règles Firebase ne permettent pas les opérations d'upload. Ce guide configure les permissions correctes.

## 📋 Prérequis

1. Accéder à la [Console Firebase](https://console.firebase.google.com/)
2. Sélectionner le projet : **lia-pdf**
3. Avoir les droits d'administrateur du projet

---

## 🔥 Firestore Database Rules

### Emplacement
Console Firebase → **Firestore Database** → **Règles**

### Configuration recommandée

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Fonction pour vérifier si l'utilisateur est authentifié
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Collection archives/pdf/{year}
    match /archives/pdf/{year}/{journalId} {
      
      // ✅ LECTURE : Accessible à tous (public)
      allow read: if true;
      
      // ✅ CRÉATION/MODIFICATION : Uniquement utilisateurs authentifiés
      allow create, update: if isAuthenticated();
      
      // ✅ SUPPRESSION : Uniquement utilisateurs authentifiés
      allow delete: if isAuthenticated();
      
      // ⚠️ OPTION ALTERNATIVE : Si vous voulez restreindre aux admins
      // allow create, update, delete: if isAuthenticated() 
      //   && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Permettre l'incrémentation des vues/téléchargements (lecture publique)
    match /archives/pdf/{year}/{journalId} {
      allow update: if request.resource.data.diff(resource.data)
        .affectedKeys().hasOnly(['views', 'downloads']);
    }
    
    // Collection users (si utilisée)
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
  }
}
```

### 🔴 Configuration temporaire pour debugging (NON RECOMMANDÉE EN PRODUCTION)

Si vous voulez tester rapidement sans authentification :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // ⚠️ DANGER : À utiliser uniquement en dev
    }
  }
}
```

**⚠️ ATTENTION** : Cette configuration ouvre votre base de données à tout le monde. À utiliser uniquement pour tester, puis remplacer par les règles sécurisées ci-dessus.

---

## 📦 Firebase Storage Rules

### Emplacement
Console Firebase → **Storage** → **Règles**

### Configuration recommandée

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Fonction pour vérifier si l'utilisateur est authentifié
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Fonction pour valider la taille des fichiers
    function validImageSize() {
      return request.resource.size < 5 * 1024 * 1024; // 5 MB max
    }
    
    function validPdfSize() {
      return request.resource.size < 50 * 1024 * 1024; // 50 MB max
    }
    
    // Images de couverture
    match /archives/covers/{year}/{fileName} {
      // ✅ LECTURE : Public
      allow read: if true;
      
      // ✅ UPLOAD : Authentifié + Validation type/taille
      allow write: if isAuthenticated() 
        && request.resource.contentType.matches('image/.*')
        && validImageSize();
    }
    
    // Fichiers PDF
    match /archives/pdf/{year}/{fileName} {
      // ✅ LECTURE : Public
      allow read: if true;
      
      // ✅ UPLOAD : Authentifié + Validation type/taille
      allow write: if isAuthenticated() 
        && request.resource.contentType == 'application/pdf'
        && validPdfSize();
    }
    
    // Autres fichiers archives (legacy)
    match /archives/{allPaths=**} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
  }
}
```

### 🔴 Configuration temporaire pour debugging (NON RECOMMANDÉE EN PRODUCTION)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true; // ⚠️ DANGER : À utiliser uniquement en dev
    }
  }
}
```

---

## ✅ Étapes de déploiement

### 1. Configurer Firestore

1. Ouvrir [Console Firebase](https://console.firebase.google.com/)
2. Sélectionner le projet **lia-pdf**
3. Menu **Firestore Database** → **Règles**
4. Copier-coller les règles Firestore ci-dessus
5. Cliquer **Publier**

### 2. Configurer Storage

1. Dans le même projet Firebase
2. Menu **Storage** → **Règles**
3. Copier-coller les règles Storage ci-dessus
4. Cliquer **Publier**

### 3. Tester l'authentification

Vérifier que l'authentification Firebase est activée :

1. Menu **Authentication** → **Sign-in method**
2. Activer au minimum :
   - ✅ **Email/Password**
   - ✅ **Google** (optionnel mais recommandé)

### 4. Créer un compte admin

1. Menu **Authentication** → **Users**
2. Cliquer **Add user**
3. Créer un compte avec email/password
4. Utiliser ce compte pour se connecter sur `/connexion`

---

## 🧪 Vérification de la configuration

### Test 1 : Lecture publique (doit fonctionner)

```javascript
// Dans la console navigateur (F12)
const { collection, getDocs } = require('firebase/firestore');
const { db } = require('./firebase');

const docs = await getDocs(collection(db, 'archives', 'pdf', '2024'));
console.log('Nombre de documents:', docs.size); // Doit afficher le nombre
```

### Test 2 : Écriture authentifiée (doit fonctionner après connexion)

1. Se connecter sur `/connexion`
2. Aller sur `/journal`
3. Essayer d'uploader un journal
4. Doit réussir sans erreur "permission-denied"

### Test 3 : Écriture non authentifiée (doit échouer)

1. Se déconnecter
2. Essayer d'uploader → Doit afficher "Authentification requise"

---

## 🔍 Debugging des permissions

### Erreur : "Missing or insufficient permissions"

**Causes possibles** :

1. **L'utilisateur n'est pas authentifié**
   - Solution : Se connecter via `/connexion`
   - Vérifier : `firebase.auth().currentUser` doit retourner un utilisateur

2. **Les règles Firestore sont trop restrictives**
   - Solution : Utiliser les règles ci-dessus
   - Vérifier dans Console Firebase → Firestore → Règles

3. **Les règles Storage sont trop restrictives**
   - Solution : Utiliser les règles Storage ci-dessus
   - Vérifier dans Console Firebase → Storage → Règles

4. **Le token d'authentification a expiré**
   - Solution : Se déconnecter et se reconnecter
   - Firebase rafraîchira automatiquement le token

### Erreur : "storage/unauthorized"

**Causes** :
- Les règles Storage n'autorisent pas l'upload
- L'utilisateur n'est pas authentifié

**Solution** :
```javascript
// Vérifier l'authentification
import { auth } from './firebase';
console.log('User:', auth.currentUser); // Doit afficher un objet utilisateur
```

### Erreur : "unauthenticated"

**Cause** : La session Firebase a expiré

**Solution** :
1. Se reconnecter sur `/connexion`
2. Réessayer l'upload

---

## 📱 Configuration de l'authentification dans le code

Le composant `ModernJournalUpload.tsx` vérifie automatiquement l'authentification :

```typescript
// Vérification automatique
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setIsAuthenticated(!!user);
    
    if (!user) {
      toast.error("Vous devez être connecté pour uploader des journaux");
    }
  });

  return () => unsubscribe();
}, []);
```

### Redirection automatique

Si l'utilisateur tente d'uploader sans être connecté :
- Affichage d'un message d'erreur
- Redirection vers `/connexion`

---

## 🚀 Configuration avancée (Rôles admin)

Si vous voulez restreindre l'upload aux administrateurs uniquement :

### 1. Ajouter un champ role dans Firestore

Créer une collection `users` :

```javascript
// Structure d'un document user
{
  uid: "firebase_user_id",
  email: "admin@afrikipresse.fr",
  role: "admin", // ou "user"
  createdAt: Timestamp
}
```

### 2. Modifier les règles Firestore

```javascript
match /archives/pdf/{year}/{journalId} {
  allow create, update, delete: if isAuthenticated() 
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### 3. Créer manuellement les admins

Dans Firestore, ajouter manuellement les documents users avec `role: "admin"`.

---

## 📊 Monitoring des règles

### Tableau de bord Firebase

Console Firebase → **Firestore/Storage** → **Usage** :
- Surveiller le nombre de lectures/écritures
- Détecter les tentatives d'accès refusées
- Analyser les patterns d'utilisation

### Logs d'erreurs

Dans le code, toutes les erreurs sont loggées :

```typescript
catch (error: any) {
  console.error("Erreur upload:", error);
  
  if (error.code === "permission-denied") {
    // Erreur de permission Firebase
  }
}
```

---

## ✨ Résumé

### Configuration minimale

1. **Firestore** : Règles avec authentification
2. **Storage** : Règles avec authentification + validation taille
3. **Authentication** : Email/Password activé
4. **Utilisateur** : Créer au moins un compte admin

### Commandes de test

```bash
# 1. Lancer l'app en dev
npm run dev

# 2. Ouvrir http://localhost:3000/connexion
# 3. Se connecter avec un compte

# 4. Accéder à http://localhost:3000/journal
# 5. Tester l'upload d'un journal

# ✅ Si ça fonctionne : Configuration OK
# ❌ Si erreur "permission-denied" : Vérifier les règles Firebase
```

---

## 🆘 Support

En cas de problème persistant :

1. **Vérifier la console navigateur** (F12) pour les erreurs détaillées
2. **Vérifier les règles Firebase** dans la console
3. **Tester avec les règles "allow all"** temporairement
4. **Vérifier que l'utilisateur est bien authentifié** : `auth.currentUser`
5. **Consulter les logs Firebase** : Console → Firestore/Storage → Usage

---

**Date de création** : 25 novembre 2024  
**Version** : 1.0  
**Projet** : Afrikipresse - Système de gestion des journaux
