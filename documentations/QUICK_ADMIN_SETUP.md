# 🚀 GUIDE RAPIDE - Configuration Admin

## ⚡ En 3 étapes (5 minutes)

### Étape 1 : Créer un compte (2 min)

1. Ouvrir : `http://localhost:3000/connexion`
2. Cliquer **"Créer un compte"**
3. Remplir :
   - Email : `admin@afrikipresse.fr`
   - Mot de passe : (votre mot de passe)
   - Nom : Admin
   - Prénom : Afrikipresse
4. Valider l'inscription

### Étape 2 : Ajouter le rôle ADMIN (2 min)

1. Ouvrir [Console Firebase](https://console.firebase.google.com/project/lia-pdf/firestore)
2. **Firestore Database** → Collection **`users`**
3. Trouver le document avec l'email `admin@afrikipresse.fr`
4. Cliquer sur le document
5. **Add field** :
   ```
   Champ : role
   Type : string
   Valeur : ADMIN
   ```
6. Cliquer **"Save"**

### Étape 3 : Se connecter et tester (1 min)

1. Retour sur : `http://localhost:3000/connexion`
2. Se connecter avec les identifiants créés
3. Accéder à : `http://localhost:3000/journal`
4. ✅ **Vous devriez voir** :
   - Header bleu avec badge "ADMIN"
   - Formulaire d'upload
   - Liste des journaux

---

## ✅ Résultat attendu

### Header administrateur

```
┌──────────────────────────────────────────────────────┐
│  [👤] Admin Afrikipresse [🛡️ ADMIN]   [Déconnexion]  │
│       ✉️ admin@afrikipresse.fr                       │
└──────────────────────────────────────────────────────┘
```

### Formulaire visible

- ✅ Champ titre
- ✅ Champ numéro de parution
- ✅ Upload de couverture
- ✅ Upload PDF
- ✅ Tags et description

---

## 🧪 Test de sécurité

### Test 1 : Sans connexion
```bash
# Navigation privée → /journal
❌ Redirection vers /connexion
✅ Message : "Vous devez être connecté..."
```

### Test 2 : Compte sans rôle ADMIN
```bash
# Se connecter avec un compte normal
# Accéder à /journal
❌ Redirection vers /
✅ Message : "Accès refusé : vous devez être administrateur"
```

### Test 3 : Compte ADMIN
```bash
# Se connecter avec admin@afrikipresse.fr
# Accéder à /journal
✅ Page accessible
✅ Badge "ADMIN" visible
✅ Formulaire d'upload affiché
```

---

## 🆘 Problèmes fréquents

### "Accès refusé : vous devez être administrateur"

**Cause** : Le champ `role` n'est pas à "ADMIN"

**Solution** :
1. Console Firebase → Firestore → users
2. Trouver votre document utilisateur
3. Vérifier que `role = "ADMIN"` (exactement en MAJUSCULES)

### "Profil utilisateur introuvable"

**Cause** : Document Firestore n'existe pas

**Solution** :
1. Créer manuellement le document dans Firestore
2. Collection : `users`
3. Document ID : Votre UID Firebase Auth
4. Ajouter les champs :
   ```json
   {
     "email": "admin@afrikipresse.fr",
     "nom": "Admin",
     "prenom": "Afrikipresse",
     "role": "ADMIN"
   }
   ```

### Boucle de redirection

**Cause** : Problème de code ou de configuration

**Solution** :
1. Vider le cache navigateur
2. Déconnexion / Reconnexion
3. Vérifier la console navigateur (F12) pour les erreurs

---

## 📝 Commandes utiles

### Vérifier l'utilisateur connecté (Console navigateur F12)

```javascript
// Voir l'utilisateur actuel
import { auth } from './firebase';
console.log('User:', auth.currentUser);
console.log('Email:', auth.currentUser?.email);
console.log('UID:', auth.currentUser?.uid);

// Voir le rôle dans Firestore
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
console.log('User data:', userDoc.data());
console.log('Role:', userDoc.data()?.role);
```

---

## 🔗 Liens rapides

- 🔥 [Console Firebase](https://console.firebase.google.com/project/lia-pdf)
- 👤 [Authentication Users](https://console.firebase.google.com/project/lia-pdf/authentication/users)
- 📊 [Firestore Database](https://console.firebase.google.com/project/lia-pdf/firestore)
- 🔐 [Page Connexion](http://localhost:3000/connexion)
- 📰 [Dashboard Journal](http://localhost:3000/journal)

---

## 📚 Documentation complète

Pour plus de détails, consultez :
- `ADMIN_ROLES_CONFIGURATION.md` - Configuration détaillée des rôles
- `FIREBASE_RULES_CONFIGURATION.md` - Configuration des règles Firebase
- `JOURNAL_MODERNIZATION_GUIDE.md` - Guide complet du système de journaux

---

✅ **Configuration terminée !** Vous pouvez maintenant gérer les journaux de manière sécurisée.
