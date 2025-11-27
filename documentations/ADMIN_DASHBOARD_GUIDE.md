# 📊 TABLEAU DE BORD ADMINISTRATEUR - Documentation

## 🎯 Vue d'ensemble

Le tableau de bord administrateur (`/admin`) est une interface moderne et sécurisée permettant aux administrateurs de gérer l'ensemble de la plateforme Afrikipresse.

### 🔐 Sécurité

- **Accès réservé** : Uniquement aux utilisateurs avec `role: "ADMIN"` dans Firestore
- **Vérification en temps réel** : Firebase Auth + Firestore
- **Redirections automatiques** : 
  - Non connecté → `/connexion?redirect=/admin`
  - Pas admin → `/` avec message d'erreur

---

## 📈 Statistiques Disponibles

### 1. Cartes principales

#### 👥 Total Utilisateurs
- **Nombre total** d'utilisateurs inscrits (Firebase Auth + Firestore)
- **Nouveaux ce mois** : Compteur des inscriptions du mois en cours
- **Source** : Collection Firestore `users`

#### ✅ Abonnements Actifs
- **Nombre d'abonnements actifs** (status: "active")
- **Total des abonnements** (tous statuts confondus)
- **Croissance** : Pourcentage de croissance des abonnements
- **Source** : Supabase `subscriptions` table

#### 💰 Revenus Mensuels
- **Revenus du mois en cours** (EUR)
- **Croissance** : Pourcentage de croissance des revenus
- **Calcul** : Somme des `unit_amount` des abonnements actifs créés ce mois
- **Source** : Supabase `subscriptions` + `prices` tables

#### 📰 Journaux Publiés
- **Nombre total** de journaux disponibles
- **Source** : Collection Firestore `journals`

### 2. Carte revenus totaux

```
┌────────────────────────────────────────────┐
│  Revenus Totaux                            │
│  €XX,XXX.XX                                │
│  Depuis le lancement de la plateforme      │
└────────────────────────────────────────────┘
```

- **Montant total** de tous les revenus depuis le début
- **Design** : Gradient bleu-violet avec icône TrendingUp
- **Calcul** : Somme de tous les `unit_amount` des abonnements actifs

---

## 🎛️ Actions Rapides

### 1. Gestion des Journaux
```typescript
onClick={() => router.push("/journal")}
```
- **Destination** : `/journal`
- **Fonctionnalités** :
  - Upload de journaux (couverture + PDF)
  - Gestion des métadonnées (titre, numéro, tags)
  - Liste de tous les journaux
  - Suppression de journaux

### 2. Gestion Utilisateurs
```typescript
onClick={() => router.push("/admin/users")}
```
- **Destination** : `/admin/users` (à créer)
- **Fonctionnalités prévues** :
  - Liste de tous les utilisateurs
  - Détails utilisateur (email, nom, date d'inscription)
  - Modification des rôles (USER ↔ ADMIN)
  - Désactivation de comptes
  - Recherche et filtres

### 3. Gestion Abonnements
```typescript
onClick={() => router.push("/admin/subscriptions")}
```
- **Destination** : `/admin/subscriptions` (à créer)
- **Fonctionnalités prévues** :
  - Liste complète des abonnements
  - Détails abonnement (montant, période, statut)
  - Annulation d'abonnements
  - Historique des paiements
  - Filtres par statut

---

## 📋 Tableau des Abonnements Récents

### Structure

| Colonne | Description | Source |
|---------|-------------|--------|
| **ID Abonnement** | ID Stripe tronqué (20 chars) | `subscriptions.id` |
| **Utilisateur** | ID utilisateur Supabase | `subscriptions.user_id` |
| **Statut** | Badge coloré du statut | `subscriptions.status` |
| **Montant** | Prix en EUR formaté | `prices.unit_amount / 100` |
| **Période** | Mensuel/Annuel | `prices.interval` |
| **Date** | Date de création | `subscriptions.created` |

### Statuts et couleurs

```typescript
const colors = {
  active: "bg-green-100 text-green-800",      // ✅ Actif
  trialing: "bg-blue-100 text-blue-800",      // 🔵 Essai
  canceled: "bg-red-100 text-red-800",        // ❌ Annulé
  past_due: "bg-orange-100 text-orange-800",  // ⚠️ Impayé
};
```

### Limite d'affichage

- **5 abonnements** les plus récents
- **Bouton "Voir tout"** → Redirige vers `/admin/subscriptions`
- **Tri** : Par date de création décroissante

---

## 🔧 Architecture Technique

### Sources de données

#### 1. Firebase (Auth + Firestore)

```typescript
// Utilisateurs
const usersSnapshot = await getDocs(collection(db, "users"));
const totalUsers = usersSnapshot.size;

// Journaux
const journalsSnapshot = await getDocs(collection(db, "journals"));
const journalsCount = journalsSnapshot.size;
```

**Collections utilisées** :
- `users` : Informations utilisateurs + rôles
- `journals` : Journaux publiés

#### 2. Supabase (Abonnements + Paiements)

```typescript
const { data: subscriptions } = await supabaseAdmin
  .from("subscriptions")
  .select(`
    *,
    prices (
      unit_amount,
      interval,
      currency
    )
  `)
  .order("created", { ascending: false });
```

**Tables utilisées** :
- `subscriptions` : Abonnements Stripe
- `prices` : Tarifs des produits
- `customers` : Mapping Stripe ↔ Supabase

### Flux d'authentification

```
1. Page charge
   ↓
2. onAuthStateChanged écoute
   ↓
3. Utilisateur connecté ?
   ↓ NON → redirect /connexion
   ↓ OUI
4. Récupérer document Firestore users/{uid}
   ↓
5. role === "ADMIN" ?
   ↓ NON → redirect / avec erreur
   ↓ OUI
6. Charger statistiques
   ↓
7. Afficher dashboard
```

### États de chargement

```typescript
const [checking, setChecking] = useState(true);      // Vérif auth
const [loading, setLoading] = useState(true);        // Vérif rôle
const [loadingStats, setLoadingStats] = useState(true); // Stats
```

**Affichage conditionnel** :
1. `checking || loading` → Spinner de vérification
2. `!user || role !== "ADMIN"` → Page "Accès refusé"
3. `loadingStats` → Spinner dans les cartes
4. Sinon → Dashboard complet

---

## 🎨 Design

### Palette de couleurs

```css
/* Cartes statistiques */
- Utilisateurs : bg-blue-100 / text-blue-600
- Abonnements : bg-green-100 / text-green-600
- Revenus : bg-purple-100 / text-purple-600
- Journaux : bg-orange-100 / text-orange-600

/* Revenus totaux */
- Gradient : from-blue-600 to-purple-600
- Texte : white / blue-100

/* Actions rapides */
- Fond : white
- Bordure : gray-200 (hover: blue/green/purple-500)
- Icônes : Même couleur que les cartes stats
```

### Responsive Design

- **Mobile** : Colonnes simples (grid-cols-1)
- **Tablette** : 2 colonnes (md:grid-cols-2)
- **Desktop** : 4 colonnes (lg:grid-cols-4)
- **Actions** : 3 colonnes sur desktop (md:grid-cols-3)

### Icônes (lucide-react)

```typescript
Shield        // Header admin
Users         // Utilisateurs totaux
UserCheck     // Abonnements actifs
DollarSign    // Revenus mensuels
Newspaper     // Journaux publiés
TrendingUp    // Carte revenus totaux
CreditCard    // Action abonnements
ArrowUpRight  // Croissance positive
ArrowDownRight // Croissance négative
```

---

## 📊 Calculs Statistiques

### Nouveaux utilisateurs ce mois

```typescript
const now = new Date();
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

usersSnapshot.forEach((doc) => {
  const data = doc.data();
  if (data.createdAt && data.createdAt.toDate() >= startOfMonth) {
    newUsersThisMonth++;
  }
});
```

### Revenus mensuels

```typescript
subscriptions?.forEach((sub) => {
  if (sub.status === "active" && sub.prices) {
    const amount = (sub.prices.unit_amount || 0) / 100; // Centimes → EUR
    totalRevenue += amount;
    
    const createdDate = new Date(sub.created);
    if (createdDate >= startOfMonth) {
      monthlyRevenue += amount;
    }
  }
});
```

### Croissance (placeholder)

```typescript
// À améliorer avec données réelles
const subscriptionGrowth = totalSubscriptions > 0 ? 12.5 : 0;
const revenueGrowth = totalRevenue > 0 ? 8.3 : 0;
```

**TODO** : Implémenter calcul réel avec données du mois précédent

---

## 🚀 Prochaines Étapes

### Pages à créer

1. **`/admin/users`** - Gestion complète des utilisateurs
   - Liste paginée
   - Recherche par email/nom
   - Modification des rôles
   - Désactivation de comptes
   - Historique d'activité

2. **`/admin/subscriptions`** - Gestion complète des abonnements
   - Liste paginée
   - Filtres par statut
   - Détails complets
   - Annulation d'abonnements
   - Remboursements
   - Historique des paiements

3. **`/admin/analytics`** - Analytics avancés
   - Graphiques de croissance
   - Taux de conversion
   - Churn rate
   - MRR (Monthly Recurring Revenue)
   - Lifetime Value

4. **`/admin/settings`** - Paramètres système
   - Configuration des prix
   - Gestion des produits Stripe
   - Configuration Firebase
   - Variables d'environnement
   - Logs système

### Améliorations statistiques

- **Graphiques** : Intégrer Recharts ou Chart.js
- **Export** : CSV/Excel des données
- **Notifications** : Alertes en temps réel
- **Comparaisons** : Mois précédent vs actuel
- **Prédictions** : Machine learning pour prévisions

---

## 🧪 Tests

### Test 1 : Accès non autorisé

```bash
# Navigation privée → /admin
❌ Redirection vers /connexion?redirect=/admin
✅ Message : "Vous devez être connecté..."
```

### Test 2 : Utilisateur normal

```bash
# Compte avec role="USER"
# Accéder à /admin
❌ Redirection vers /
✅ Message : "Accès refusé : vous devez être administrateur"
```

### Test 3 : Administrateur

```bash
# Compte avec role="ADMIN"
# Accéder à /admin
✅ Dashboard visible
✅ Statistiques chargées
✅ Badge "ADMIN" dans header
✅ 3 boutons d'actions rapides
✅ Tableau des abonnements récents
```

---

## 🔧 Configuration requise

### Variables d'environnement

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  # ⚠️ SERVER-SIDE ONLY
```

### Rôles Firestore

```typescript
// Collection: users
// Document ID: {firebase_auth_uid}
{
  email: "admin@afrikipresse.fr",
  nom: "Nom",
  prenom: "Prénom",
  role: "ADMIN",  // ⚠️ REQUIS
  createdAt: Timestamp
}
```

---

## 📚 Ressources

- **Guide configuration admin** : `ADMIN_ROLES_CONFIGURATION.md`
- **Setup rapide** : `QUICK_ADMIN_SETUP.md`
- **Système journaux** : `JOURNAL_MODERNIZATION_GUIDE.md`
- **Firebase rules** : `FIREBASE_RULES_CONFIGURATION.md`

---

✅ **Tableau de bord opérationnel !** Prêt pour gérer Afrikipresse.
