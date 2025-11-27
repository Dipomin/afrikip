# 🔧 Installation des dépendances - Système d'authentification

## Dépendances à installer

```bash
npm install @supabase/supabase-js
```

## Vérification des dépendances existantes

Les dépendances suivantes devraient déjà être installées:
- ✅ `firebase` (Firestore, Storage)
- ✅ `next` (Next.js 14)
- ✅ `react` & `react-dom`
- ✅ `axios` (CinetPay API)
- ✅ `lucide-react` (icons)
- ✅ `class-variance-authority` (styling)

## Commandes d'installation

### Installation complète

```bash
# Installer la dépendance Supabase
npm install @supabase/supabase-js

# Ou avec yarn
yarn add @supabase/supabase-js
```

### Vérifier l'installation

```bash
# Vérifier que le package est installé
npm list @supabase/supabase-js

# Lancer le build pour vérifier qu'il n'y a pas d'erreurs
npm run build
```

## Fichiers à vérifier après installation

### 1. package.json

Devrait contenir:
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x.x",
    "firebase": "^10.x.x",
    "next": "^14.x.x",
    "react": "^18.x.x",
    // ... autres dépendances
  }
}
```

### 2. .env.local

Doit contenir toutes les variables:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# CinetPay
CINETPAY_KEY=votre_cle_api
CINETPAY_SITE_ID=votre_site_id
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 3. Redémarrer le serveur

```bash
# Arrêter le serveur en cours (Ctrl+C dans le terminal)

# Redémarrer
npm run dev
```

## Résolution des erreurs potentielles

### Erreur: "Cannot find module '@supabase/supabase-js'"

**Solution**:
```bash
# Supprimer node_modules et package-lock.json
rm -rf node_modules package-lock.json

# Réinstaller toutes les dépendances
npm install

# Redémarrer
npm run dev
```

### Erreur: "Property 'refresh' does not exist on type 'NextRouter'"

**Cause**: Le fichier `SupabaseProvider.tsx` utilise `router.refresh()` qui n'existe pas dans Next.js Pages Router

**Solution**: Déjà corrigé dans le code fourni (utilise seulement `router` sans `.refresh()`)

### Erreur TypeScript sur imports Supabase

**Solution**:
```bash
# Vérifier que types_db.ts existe et est à jour
ls -la types_db.ts

# Si besoin, régénérer les types Supabase
# (nécessite @supabase/cli installé globalement)
npx supabase gen types typescript --project-id <project-id> > types_db.ts
```

## Tests après installation

### 1. Vérifier que l'app démarre

```bash
npm run dev
```

Devrait afficher:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 2. Vérifier les imports Supabase

Ouvrir http://localhost:3000 dans le navigateur.

Console navigateur ne devrait PAS afficher:
- ❌ "Cannot find module..."
- ❌ "Module not found..."

### 3. Tester l'authentification

```bash
# Aller sur la page de connexion
http://localhost:3000/signin

# Vérifier que le formulaire s'affiche
# Console ne devrait pas avoir d'erreurs
```

### 4. Tester les hooks

```bash
# Aller sur le dashboard (redirigera vers signin si non connecté)
http://localhost:3000/dashboard

# Console devrait afficher des logs de useAuth
```

## Ordre d'exécution recommandé

1. **Installer les dépendances**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Vérifier .env.local**
   - Toutes les variables Supabase présentes
   - Toutes les variables CinetPay présentes

3. **Redémarrer le serveur**
   ```bash
   npm run dev
   ```

4. **Tester la boutique**
   ```bash
   http://localhost:3000/lintelligentpdf
   ```

5. **Tester une page détail**
   ```bash
   http://localhost:3000/lintelligentpdf/[id-existant]
   ```

6. **Se connecter**
   ```bash
   http://localhost:3000/signin
   ```

7. **Tester le dashboard**
   ```bash
   http://localhost:3000/dashboard
   ```

## Checklist finale

- [ ] `@supabase/supabase-js` installé
- [ ] `.env.local` contient toutes les variables
- [ ] Serveur démarre sans erreur
- [ ] Page boutique charge correctement
- [ ] Page détail PDF affiche preview
- [ ] Redirection signin fonctionne
- [ ] Dashboard accessible après connexion
- [ ] Pas d'erreurs dans console navigateur
- [ ] Pas d'erreurs dans console serveur

## Support

Si des erreurs persistent:
1. Vérifier les logs console (navigateur + serveur)
2. Vérifier que tous les fichiers créés sont présents
3. Vérifier les permissions Firestore
4. Vérifier la configuration Supabase

---

**Note**: Le système est conçu pour fonctionner même si certaines dépendances sont manquantes initialement. Les erreurs TypeScript liées à `@supabase/supabase-js` disparaîtront après l'installation du package.
