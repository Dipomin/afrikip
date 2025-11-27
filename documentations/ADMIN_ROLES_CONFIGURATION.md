# 🔐 Configuration des rôles administrateurs

## Vue d'ensemble

Le système de gestion des journaux est maintenant sécurisé avec un système de rôles. Seuls les utilisateurs avec le rôle **"ADMIN"** peuvent accéder à `/journal` pour uploader et gérer les journaux.

## 🎯 Fonctionnalités de sécurité

### Protection de la page `/journal`

1. **Vérification d'authentification** : L'utilisateur doit être connecté
2. **Vérification du rôle** : L'utilisateur doit avoir `role: "ADMIN"` dans Firestore
3. **Redirection automatique** : Les non-autorisés sont redirigés vers `/connexion` ou `/`
4. **Messages d'erreur** : Toast notifications pour informer l'utilisateur

### Composant UserHeader

Affiche en haut de la page :
- ✅ Avatar et nom de l'utilisateur
- ✅ Badge "ADMIN" si rôle administrateur
- ✅ Email de l'utilisateur
- ✅ Bouton de déconnexion
- ✅ Bouton "Se connecter" si non authentifié

---

## 📝 Configuration d'un compte administrateur

### Option 1 : Via Console Firebase (Recommandé)

#### Étape 1 : Créer un compte utilisateur

1. Aller sur votre application : `http://localhost:3000/connexion`
2. Cliquer sur **"Créer un compte"**
3. Remplir le formulaire :
   - Email : `admin@afrikipresse.fr`
   - Mot de passe : (votre mot de passe sécurisé)
   - Nom : Admin
   - Prénom : Afrikipresse
   - Autres champs requis
4. Valider l'inscription

#### Étape 2 : Ajouter le rôle ADMIN dans Firestore

1. Ouvrir [Console Firebase](https://console.firebase.google.com/project/lia-pdf/firestore)
2. Aller dans **Firestore Database**
3. Naviguer vers la collection **`users`**
4. Trouver le document avec l'email créé (`admin@afrikipresse.fr`)
5. Cliquer sur le document
6. Cliquer sur **"Add field"** (ou modifier si le champ existe)
7. Ajouter/modifier :
   ```
   Champ : role
   Type : string
   Valeur : ADMIN
   ```
8. Cliquer **"Update"** ou **"Save"**

#### Étape 3 : Vérifier l'accès

1. Se connecter avec le compte admin : `http://localhost:3000/connexion`
2. Accéder à : `http://localhost:3000/journal`
3. ✅ Vous devriez voir :
   - Le header avec badge "ADMIN"
   - Le formulaire d'upload
   - La liste des journaux

---

### Option 2 : Script automatique (Avancé)

Créer un script pour ajouter automatiquement le rôle admin :

```typescript
// scripts/makeAdmin.ts
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  // Votre config Firebase
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function makeAdmin(userId: string) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      role: "ADMIN",
    });
    console.log("✅ Utilisateur promu administrateur");
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

// Remplacer par l'UID Firebase de l'utilisateur
makeAdmin("VOTRE_USER_ID_ICI");
```

Exécuter avec :
```bash
npx ts-node scripts/makeAdmin.ts
```

---

## 🏗️ Structure Firestore

### Collection `users`

Chaque document utilisateur doit contenir :

```typescript
{
  // Champs existants
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  ville?: string;
  pays?: string;
  createdAt: Timestamp;
  subscriptionStatus?: string;
  subscriptionType?: string;
  subscriptionEndDate?: Timestamp;
  
  // 🆕 NOUVEAU CHAMP REQUIS POUR LES ADMINS
  role: "ADMIN" | "USER";  // "ADMIN" pour accès journal
}
```

### Exemple de document admin

```json
{
  "email": "admin@afrikipresse.fr",
  "nom": "Afrikipresse",
  "prenom": "Admin",
  "telephone": "+225 07 00 00 00 00",
  "ville": "Abidjan",
  "pays": "Côte d'Ivoire",
  "role": "ADMIN",
  "createdAt": {
    "_seconds": 1700000000,
    "_nanoseconds": 0
  },
  "subscriptionStatus": "active",
  "subscriptionType": "lifetime"
}
```

---

## 🔒 Flux de sécurité

### 1. Utilisateur accède à `/journal`

```
┌─────────────────────────────────────┐
│  Utilisateur accède à /journal      │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  onAuthStateChanged vérifie auth    │
└───────────────┬─────────────────────┘
                │
        ┌───────┴───────┐
        │               │
    Connecté ?      Non connecté
        │               │
        ▼               ▼
    ┌───────┐    ┌──────────────┐
    │  OUI  │    │  Redirection │
    └───┬───┘    │  /connexion  │
        │        └──────────────┘
        ▼
┌─────────────────────────────────────┐
│  Récupérer données Firestore        │
│  users/{userId}                     │
└───────────────┬─────────────────────┘
                │
        ┌───────┴───────┐
        │               │
    role="ADMIN"?    Autre rôle
        │               │
        ▼               ▼
    ┌───────┐    ┌──────────────┐
    │ ACCÈS │    │  Redirection │
    │ AUTORISÉ  │    │  / (accueil) │
    └───────┘    └──────────────┘
```

### 2. Affichage conditionnel

```typescript
// Vérification côté client
if (!user || userData?.role !== "ADMIN") {
  return <AccessDenied />; // Écran d'accès refusé
}

// Affichage normal
return (
  <>
    <UserHeader user={user} userRole={userData.role} />
    <ModernJournalUpload />
    <TableWrapper />
  </>
);
```

---

## 🧪 Tests de sécurité

### Test 1 : Utilisateur non connecté

```bash
# Ouvrir en navigation privée
http://localhost:3000/journal

# Résultat attendu :
✅ Redirection vers /connexion
✅ Toast : "Vous devez être connecté..."
```

### Test 2 : Utilisateur connecté sans rôle ADMIN

```bash
# Se connecter avec un compte utilisateur normal
# (sans champ role ou role="USER")

# Accéder à /journal
http://localhost:3000/journal

# Résultat attendu :
✅ Redirection vers /
✅ Toast : "Accès refusé : vous devez être administrateur"
```

### Test 3 : Administrateur connecté

```bash
# Se connecter avec un compte admin (role="ADMIN")
# Accéder à /journal

# Résultat attendu :
✅ Page affichée normalement
✅ UserHeader avec badge "ADMIN"
✅ Formulaire d'upload visible
✅ Pas de redirection
```

---

## 🎨 Design du UserHeader

### Mode connecté (ADMIN)

```
┌────────────────────────────────────────────────────────┐
│  [👤]  Admin Afrikipresse  [🛡️ ADMIN]        [Déconnexion] │
│        ✉️ admin@afrikipresse.fr                         │
└────────────────────────────────────────────────────────┘
```

### Mode connecté (USER normal)

```
┌────────────────────────────────────────────────────────┐
│  [👤]  Jean Dupont                        [Déconnexion] │
│        ✉️ jean.dupont@example.com                       │
└────────────────────────────────────────────────────────┘
```

### Mode non connecté

```
┌────────────────────────────────────────────────────────┐
│  [👤]  Non connecté                       [Se connecter] │
│        Connectez-vous pour accéder au dashboard         │
└────────────────────────────────────────────────────────┘
```

---

## 🚨 Gestion des erreurs

### Erreurs possibles et solutions

| Erreur | Cause | Solution |
|--------|-------|----------|
| "Vous devez être connecté..." | Pas d'authentification | Se connecter via `/connexion` |
| "Accès refusé : vous devez être administrateur" | Role ≠ "ADMIN" | Ajouter `role: "ADMIN"` dans Firestore |
| "Profil utilisateur introuvable" | Document user n'existe pas | Créer le document avec le bon UID |
| Boucle de redirection | Erreur dans le code | Vérifier les conditions de redirection |

---

## 📊 Monitoring et logs

### Logs dans la console

Le système log automatiquement :

```typescript
// Succès
console.log("✅ Utilisateur admin autorisé:", user.email);

// Erreurs
console.error("❌ Erreur récupération utilisateur:", error);
console.warn("⚠️ Tentative d'accès non autorisée:", user.email);
```

### Firebase Analytics (optionnel)

Ajouter des événements pour tracker :
- Nombre de tentatives d'accès refusées
- Nombre d'admins actifs
- Temps passé sur la page d'upload

---

## 🔄 Migration des utilisateurs existants

Si vous avez déjà des utilisateurs dans Firestore sans le champ `role` :

### Script de migration

```typescript
// scripts/migrateUsers.ts
import { getDocs, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

async function addRoleToAllUsers() {
  const usersSnapshot = await getDocs(collection(db, "users"));
  
  for (const userDoc of usersSnapshot.docs) {
    const data = userDoc.data();
    
    // Si pas de role, ajouter "USER" par défaut
    if (!data.role) {
      await updateDoc(doc(db, "users", userDoc.id), {
        role: "USER",
      });
      console.log(`✅ Role USER ajouté pour: ${data.email}`);
    }
  }
  
  console.log("✅ Migration terminée");
}

addRoleToAllUsers();
```

Ensuite, promouvoir manuellement les admins :

```typescript
// Promouvoir des emails spécifiques en admin
const adminEmails = [
  "admin@afrikipresse.fr",
  "directeur@afrikipresse.fr",
];

async function promoteAdmins() {
  const usersSnapshot = await getDocs(collection(db, "users"));
  
  for (const userDoc of usersSnapshot.docs) {
    const data = userDoc.data();
    
    if (adminEmails.includes(data.email)) {
      await updateDoc(doc(db, "users", userDoc.id), {
        role: "ADMIN",
      });
      console.log(`✅ ${data.email} promu ADMIN`);
    }
  }
}

promoteAdmins();
```

---

## 🎯 Liste de vérification

Avant de mettre en production :

- [ ] Au moins un compte admin créé et testé
- [ ] Champ `role` ajouté à tous les utilisateurs
- [ ] Règles Firebase Firestore configurées (lecture du champ role)
- [ ] Tests effectués (non connecté, user, admin)
- [ ] UserHeader s'affiche correctement
- [ ] Redirections fonctionnent
- [ ] Messages d'erreur sont clairs

---

## 🆘 Support et dépannage

### Commandes utiles

```bash
# Vérifier l'authentification dans la console navigateur (F12)
import { auth } from './firebase';
console.log('User:', auth.currentUser);

# Vérifier le rôle dans Firestore
import { doc, getDoc } from 'firebase/firestore';
const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
console.log('Role:', userDoc.data()?.role);
```

### Liens rapides

- 🔗 [Console Firebase - Users](https://console.firebase.google.com/project/lia-pdf/authentication/users)
- 🔗 [Console Firebase - Firestore](https://console.firebase.google.com/project/lia-pdf/firestore)
- 🔗 [Page de connexion locale](http://localhost:3000/connexion)
- 🔗 [Dashboard admin local](http://localhost:3000/journal)

---

**Date de création** : 25 novembre 2024  
**Version** : 1.0  
**Projet** : Afrikipresse - Système de gestion sécurisé des journaux
