# 🚀 Guide de Déploiement - Production

## Pré-requis avant déploiement

### 1. Installation locale complète
```bash
# Installer toutes les dépendances
npm install @supabase/supabase-js

# Vérifier que tout compile
npm run build

# Tester localement
npm run dev
```

### 2. Variables d'environnement vérifiées
- ✅ Toutes les variables Supabase configurées
- ✅ Clés CinetPay ajoutées (production)
- ✅ URLs Firebase Storage correctes
- ✅ Clés Stripe (production)

### 3. Base de données prête
- ✅ Tables Supabase créées (users, subscriptions, prices, products)
- ✅ Policies RLS configurées
- ✅ Collection Firestore `orders` avec règles
- ✅ Collection Firestore `archives/pdf/{year}` avec PDFs

---

## Déploiement sur Vercel

### Étape 1: Préparer le repository Git

```bash
# Vérifier le statut
git status

# Ajouter tous les nouveaux fichiers
git add .

# Commit
git commit -m "feat: système complet d'authentification et gestion accès PDFs

- Ajout authentification Supabase
- Ajout page détail PDF avec preview
- Ajout lecteur PDF sécurisé
- Ajout tableau de bord utilisateur (5 onglets)
- Ajout vérification accès (abonnement + achats)
- Ajout API route check-pdf-access
- Ajout hooks useAuth, useSubscription, usePDFAccess
- Modification boutique (redirection vers détail)
- Documentation complète (3 guides)"

# Push vers GitHub
git push origin main
```

### Étape 2: Configurer Vercel

1. **Connecter le projet**
   - Aller sur https://vercel.com/dashboard
   - Cliquer "Add New" → "Project"
   - Importer depuis GitHub: `Dipomin/afrikip`
   - Vercel détecte automatiquement Next.js

2. **Configurer les variables d'environnement**
   
   Dans Vercel Dashboard → Project Settings → Environment Variables:

   ```bash
   # Supabase (PRODUCTION)
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
   
   # CinetPay (PRODUCTION - IMPORTANT!)
   CINETPAY_KEY=votre_cle_production
   CINETPAY_SITE_ID=votre_site_id_production
   NEXT_PUBLIC_SITE_URL=https://afrikipresse.fr
   
   # Stripe (PRODUCTION)
   STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   STRIPE_SECRET_KEY=sk_live_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   
   # Firebase (déjà configuré)
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   
   # WordPress GraphQL (déjà configuré)
   WORDPRESS_API_URL=https://adm.afrikipresse.fr/graphql
   WORDPRESS_AUTH_REFRESH_TOKEN=...
   
   # MySQL (déjà configuré)
   DATABASE_URL=mysql://user:pass@host:3306/db
   ```

   **⚠️ IMPORTANT**: 
   - Utiliser les clés **PRODUCTION** pour CinetPay et Stripe
   - Ne JAMAIS utiliser les clés de test en production
   - `NEXT_PUBLIC_SITE_URL` doit être `https://afrikipresse.fr`

3. **Configurer les paramètres du build**
   - Framework Preset: **Next.js**
   - Build Command: `npm run build` (par défaut)
   - Output Directory: `.next` (par défaut)
   - Install Command: `npm install` (par défaut)

4. **Déployer**
   - Cliquer "Deploy"
   - Attendre le build (~3-5 minutes)
   - ✅ Déploiement réussi → URL: `https://afrikip-xxx.vercel.app`

### Étape 3: Configurer le domaine custom

1. **Ajouter le domaine**
   - Vercel Dashboard → Project Settings → Domains
   - Ajouter `afrikipresse.fr`
   - Ajouter `www.afrikipresse.fr`

2. **Configurer le DNS**
   
   Chez votre registrar (OVH, Gandi, etc.):
   ```
   Type    Name    Value
   A       @       76.76.21.21
   CNAME   www     cname.vercel-dns.com
   ```

3. **Attendre la propagation DNS** (~10-60 minutes)

4. **Vérifier HTTPS**
   - Vercel configure automatiquement SSL (Let's Encrypt)
   - Vérifier que `https://afrikipresse.fr` fonctionne

---

## Post-déploiement

### Étape 1: Configurer les webhooks

#### CinetPay
1. Se connecter au dashboard CinetPay
2. Aller dans **Configuration** → **Webhooks**
3. Ajouter l'URL de notification:
   ```
   https://afrikipresse.fr/api/cinetpay-pdf-notify
   ```
4. Activer le webhook
5. Tester avec un paiement test

#### Stripe
1. Se connecter au dashboard Stripe (mode production)
2. Aller dans **Developers** → **Webhooks**
3. Vérifier que le webhook existe:
   ```
   https://afrikipresse.fr/api/webhooks
   ```
4. Événements à écouter:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`

### Étape 2: Tester le site en production

#### Test 1: Boutique
```
✅ https://afrikipresse.fr/lintelligentpdf
→ Grille de journaux s'affiche
→ Recherche fonctionne
→ Filtres fonctionnent
```

#### Test 2: Page détail (non connecté)
```
✅ https://afrikipresse.fr/lintelligentpdf/[id]
→ Page détail s'affiche
→ Couverture verrouillée visible
→ Bouton "Se connecter" visible
→ PDFs recommandés affichés
```

#### Test 3: Connexion
```
✅ https://afrikipresse.fr/signin
→ Formulaire s'affiche
→ Login fonctionne
→ Redirection après login
```

#### Test 4: Dashboard
```
✅ https://afrikipresse.fr/dashboard
→ Stats affichées correctement
→ Onglets fonctionnent
→ Commandes chargent
```

#### Test 5: Achat PDF
```
1. Se connecter
2. Aller sur /lintelligentpdf/[id]
3. Ajouter au panier
4. Aller sur /checkout
5. Remplir formulaire
6. Payer via CinetPay (Mobile Money réel)
7. Vérifier redirection /order-success
8. Vérifier accès lecteur
```

#### Test 6: Abonnement
```
1. Se connecter
2. Aller sur /abonnement
3. Choisir formule
4. Payer via Stripe (carte réelle)
5. Vérifier dashboard
6. Vérifier accès illimité PDFs
```

### Étape 3: Monitoring

#### Vercel Analytics
- Dashboard → Analytics
- Vérifier:
  - Nombre de visiteurs
  - Pages les plus visitées
  - Temps de chargement
  - Taux d'erreur

#### Logs Vercel
- Dashboard → Logs
- Filtrer par:
  - Erreurs 500
  - Timeouts
  - API routes

#### Firestore
- Firebase Console → Firestore
- Vérifier collection `orders`:
  - Nouvelles commandes créées
  - Status correctement mis à jour
  - Webhooks CinetPay fonctionnent

#### Supabase
- Supabase Dashboard → Database
- Vérifier table `subscriptions`:
  - Nouveaux abonnements créés
  - Webhooks Stripe fonctionnent
  - Status synchronisés

---

## Résolution des problèmes production

### Erreur: "CORS policy" sur PDFs

**Cause**: CORS Firebase Storage pas configuré pour domaine production

**Solution**:
```bash
# Mettre à jour cors.json
cat > cors.json << EOF
[
  {
    "origin": ["https://afrikipresse.fr", "https://www.afrikipresse.fr"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
EOF

# Déployer
gsutil cors set cors.json gs://lia-pdf.appspot.com
```

### Erreur: "Webhook not received" (CinetPay)

**Vérifications**:
1. URL webhook correcte dans dashboard CinetPay
2. Webhook activé
3. Logs Vercel pour voir si requête arrive
4. Variables `CINETPAY_KEY` et `CINETPAY_SITE_ID` correctes

**Debug**:
```bash
# Vérifier logs Vercel
vercel logs --follow

# Tester webhook manuellement
curl -X POST https://afrikipresse.fr/api/cinetpay-pdf-notify \
  -H "Content-Type: application/json" \
  -d '{"cpm_trans_id":"TEST123","cpm_trans_status":"ACCEPTED"}'
```

### Erreur: "Subscription not found" (Stripe)

**Vérifications**:
1. Webhook Stripe configuré et actif
2. Variable `STRIPE_WEBHOOK_SECRET` correcte
3. Événements Stripe envoyés

**Debug**:
```bash
# Vérifier événements Stripe
stripe events list --limit 10

# Tester webhook Stripe
stripe trigger customer.subscription.created
```

### Erreur: "Build failed" (Vercel)

**Causes possibles**:
- Erreur TypeScript non résolue
- Import manquant
- Variable d'environnement manquante au build

**Solution**:
1. Vérifier logs de build Vercel
2. Tester build localement:
   ```bash
   npm run build
   ```
3. Corriger les erreurs
4. Commit + push

### Erreur: "Function timeout" (Vercel)

**Cause**: getServerSideProps trop lent (requêtes Firestore/Supabase)

**Solution**:
1. Optimiser requêtes (limit, index)
2. Augmenter timeout dans `vercel.json`:
   ```json
   {
     "functions": {
       "pages/lintelligentpdf/[id].tsx": {
         "maxDuration": 30
       }
     }
   }
   ```

---

## Checklist post-déploiement

### Configuration
- [ ] Variables d'environnement production configurées
- [ ] Domaine custom configuré (afrikipresse.fr)
- [ ] HTTPS actif et certificat valide
- [ ] Webhooks CinetPay configurés
- [ ] Webhooks Stripe configurés

### Tests fonctionnels
- [ ] Boutique charge correctement
- [ ] Pages détail s'affichent
- [ ] Connexion fonctionne
- [ ] Dashboard accessible
- [ ] Achat PDF (paiement réel) fonctionne
- [ ] Abonnement (paiement réel) fonctionne
- [ ] Lecteur PDF s'ouvre pour abonnés/acheteurs
- [ ] Accès refusé pour non-autorisés

### Performance
- [ ] Time to First Byte < 500ms
- [ ] Largest Contentful Paint < 2.5s
- [ ] First Input Delay < 100ms
- [ ] Cumulative Layout Shift < 0.1

### Monitoring
- [ ] Vercel Analytics configuré
- [ ] Google Analytics (GA4) actif
- [ ] Alertes Vercel configurées
- [ ] Logs Firestore surveillés
- [ ] Logs Supabase surveillés

### Sécurité
- [ ] HTTPS forcé (redirections HTTP → HTTPS)
- [ ] Headers sécurisés (CSP, X-Frame-Options, etc.)
- [ ] Supabase RLS actif
- [ ] Firestore rules déployées
- [ ] Clés API en production (pas test)

---

## Maintenance

### Quotidien
- Vérifier dashboard Vercel (erreurs, trafic)
- Vérifier paiements CinetPay
- Vérifier paiements Stripe

### Hebdomadaire
- Analyser logs d'erreurs
- Vérifier performance (Vercel Analytics)
- Vérifier commandes Firestore
- Vérifier abonnements Supabase

### Mensuel
- Mettre à jour dépendances:
  ```bash
  npm outdated
  npm update
  ```
- Sauvegarder base de données
- Analyser métriques business

---

## Rollback en cas de problème

### Option 1: Revenir à un déploiement précédent

```bash
# Via dashboard Vercel
1. Aller dans Deployments
2. Trouver le dernier déploiement stable
3. Cliquer "..." → "Promote to Production"
```

### Option 2: Rollback Git + redéploiement

```bash
# Trouver le commit stable
git log --oneline

# Revenir à ce commit
git reset --hard <commit-hash>

# Force push (attention!)
git push origin main --force

# Vercel redéploiera automatiquement
```

---

## Support

Pour tout problème en production:
1. Vérifier logs Vercel
2. Vérifier logs Firestore/Supabase
3. Vérifier webhooks (CinetPay + Stripe)
4. Consulter documentation (AUTH_SYSTEM_GUIDE.md)
5. Tester en local avec même variables production

---

**Date**: 25 novembre 2025  
**Version**: 1.0.0  
**Status**: ✅ Prêt pour production
