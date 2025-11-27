# 🔐 Guide de déploiement des règles Firebase

## ⚠️ ERREUR ACTUELLE
```
FirebaseError: Missing or insufficient permissions.
code: 'permission-denied'
```

Cette erreur signifie que vos règles de sécurité Firebase bloquent l'accès aux collections `archives`.

## 📋 SOLUTION - Déployer les nouvelles règles

### Méthode 1 : Firebase Console (Recommandée pour débutants)

1. **Ouvrir Firebase Console** : https://console.firebase.google.com
2. **Sélectionner votre projet** : Afrikipresse
3. **Firestore Database** :
   - Aller dans "Firestore Database" (menu gauche)
   - Cliquer sur l'onglet "Règles"
   - Copier-coller le contenu de `firestore.rules`
   - Cliquer sur "Publier"

4. **Storage** :
   - Aller dans "Storage" (menu gauche)
   - Cliquer sur l'onglet "Règles"
   - Copier-coller le contenu de `storage.rules`
   - Cliquer sur "Publier"

### Méthode 2 : Firebase CLI (Recommandée pour développeurs)

```bash
# 1. Installer Firebase CLI (si pas déjà fait)
npm install -g firebase-tools

# 2. Se connecter à Firebase
firebase login

# 3. Initialiser le projet (si pas déjà fait)
firebase init

# 4. Déployer uniquement les règles
firebase deploy --only firestore:rules,storage:rules
```

## 📝 Ce que font les nouvelles règles

### Firestore Rules (`firestore.rules`)

✅ **Collection `users`** :
- Lecture : Tous les utilisateurs connectés
- Écriture : Propriétaire ou ADMIN

✅ **Collection `subscriptions`** :
- Lecture : Tous les utilisateurs connectés
- Écriture : ADMIN uniquement

✅ **Collection `archives/pdf/{year}/{documentId}`** :
- Lecture : **PUBLIC** (tout le monde peut lire)
- Écriture : ADMIN uniquement

✅ **Collection `journals`** :
- Lecture : PUBLIC
- Écriture : ADMIN uniquement

### Storage Rules (`storage.rules`)

✅ **`archives/pdf/{year}/{documentId}`** :
- Lecture : **PUBLIC** (tout le monde peut télécharger)
- Upload : ADMIN uniquement

✅ **`archives/covers/{year}/{filename}`** :
- Lecture : PUBLIC
- Upload : ADMIN uniquement

✅ **`users/{userId}/profile/{filename}`** :
- Lecture : PUBLIC
- Upload : Propriétaire ou ADMIN

## 🧪 Tester après déploiement

```bash
# 1. Démarrer le serveur
npm run dev

# 2. Ouvrir dans le navigateur
http://localhost:3000/lintelligentpdf/list

# 3. Vérifier la console
# Vous ne devriez plus voir l'erreur "permission-denied"
```

## ⚙️ Configuration du rôle ADMIN

Pour qu'un utilisateur puisse uploader des journaux, il doit avoir le rôle `ADMIN` dans Firestore :

1. **Firebase Console** → **Firestore Database**
2. **Collection `users`** → Trouver l'utilisateur
3. **Ajouter/Modifier le champ** :
   ```
   role: "ADMIN"
   ```

## 🔍 Vérification des règles

### Test Firestore
```javascript
// Dans la console Firebase → Firestore → Règles → Simulateur
// Tester: Lecture de archives/pdf/2024/docId
// Auth: Non authentifié
// Résultat attendu: ✅ Autorisé
```

### Test Storage
```javascript
// Dans la console Firebase → Storage → Règles → Simulateur
// Tester: Lecture de archives/pdf/2024/journal.pdf
// Auth: Non authentifié
// Résultat attendu: ✅ Autorisé
```

## 📊 Structure des données attendue

```
Firestore:
  archives/
    pdf/
      2024/
        {documentId}:
          title: "L'Intelligent d'Abidjan"
          issueNumber: "N° 1234"
          publicationDate: Timestamp
          downloadURL: "https://..."
          coverImageURL: "https://..."
          filename: "journal.pdf"
          size: 1234567
          year: "2024"
          uploadedAt: Timestamp
          views: 0
          downloads: 0

Storage:
  archives/
    pdf/
      2024/
        {documentId}  ← Fichier PDF
    covers/
      2024/
        {documentId}_cover  ← Image de couverture
```

## 🚨 Erreurs courantes

### Erreur : "Permission denied"
**Cause** : Les règles ne sont pas encore déployées
**Solution** : Suivre les étapes de déploiement ci-dessus

### Erreur : "Firebase config not found"
**Cause** : Variables d'environnement Firebase manquantes
**Solution** : Vérifier `.env.local`

### Erreur : "User not admin"
**Cause** : L'utilisateur n'a pas le rôle ADMIN
**Solution** : Ajouter `role: "ADMIN"` dans Firestore → users → {userId}

## ✅ Checklist de déploiement

- [ ] Règles Firestore déployées
- [ ] Règles Storage déployées
- [ ] Au moins un utilisateur a le rôle `ADMIN`
- [ ] Test de lecture des archives (sans connexion)
- [ ] Test d'upload (avec utilisateur ADMIN)
- [ ] Vérification des logs (pas d'erreur "permission-denied")

## 🎯 Commandes rapides

```bash
# Déployer uniquement Firestore
firebase deploy --only firestore:rules

# Déployer uniquement Storage
firebase deploy --only storage:rules

# Déployer les deux
firebase deploy --only firestore:rules,storage:rules

# Voir les règles actuelles
firebase firestore:rules:get
firebase storage:rules:get
```

## 📞 Support

Si les erreurs persistent après le déploiement :

1. **Vérifier les logs Firebase** : Console → Firestore → Utilisation
2. **Tester les règles** : Utiliser le simulateur dans la console
3. **Vider le cache** : Ctrl+Shift+R dans le navigateur
4. **Vérifier l'authentification** : L'utilisateur est-il connecté ?

---

**Version** : 1.0  
**Date** : 2024  
**Statut** : 🚀 Prêt à déployer
