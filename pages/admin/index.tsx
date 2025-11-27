"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { User, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import UserHeader from "../../components/UserHeader";
import Layout from "../../components/layout";
import {
  Users,
  CreditCard,
  Newspaper,
  TrendingUp,
  DollarSign,
  UserCheck,
  Calendar,
  Activity,
  BarChart3,
  Loader2,
  AlertCircle,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "../../@/components/ui/button";
import toast from "react-hot-toast";

interface UserData {
  role?: string;
  nom?: string;
  prenom?: string;
  email?: string;
}

interface DashboardStats {
  totalUsers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  totalRevenue: number;
  newUsersThisMonth: number;
  journalsCount: number;
  subscriptionGrowth: number;
  revenueGrowth: number;
}

interface RecentSubscription {
  id: string;
  userId: string;
  userEmail: string;
  status: string;
  createdAt: any;
  amount: number;
  interval: string;
  method: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSubscriptions, setRecentSubscriptions] = useState<
    RecentSubscription[]
  >([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Vérification de l'authentification et du rôle ADMIN
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setChecking(true);

      if (!currentUser) {
        toast.error("Vous devez être connecté pour accéder à cette page");
        router.push("/connexion?redirect=/admin");
        return;
      }

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          toast.error("Profil utilisateur introuvable");
          router.push("/");
          return;
        }

        const data = userDoc.data() as UserData;

        if (data.role !== "ADMIN") {
          toast.error("Accès refusé : vous devez être administrateur");
          router.push("/connexion?redirect=/admin");
          return;
        }

        setUser(currentUser);
        setUserData(data);
      } catch (error) {
        console.error("Erreur lors de la vérification:", error);
        toast.error("Erreur lors de la vérification des permissions");
        router.push("/");
      } finally {
        setChecking(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Chargement des statistiques
  useEffect(() => {
    if (user && userData?.role === "ADMIN") {
      loadDashboardStats();
    }
  }, [user, userData]);

  const loadDashboardStats = async () => {
    setLoadingStats(true);
    try {
      // Charger les données Firestore (utilisateurs Firebase)
      const usersSnapshot = await getDocs(collection(db, "users"));
      const totalUsers = usersSnapshot.size;

      // Compter nouveaux utilisateurs ce mois
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      let newUsersThisMonth = 0;

      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.createdAt) {
          const createdDate = data.createdAt.toDate();
          if (createdDate >= startOfMonth) {
            newUsersThisMonth++;
          }
        }
      });

      // Charger les journaux depuis Firestore
      const journalsSnapshot = await getDocs(collection(db, "journals"));
      const journalsCount = journalsSnapshot.size;

      // Charger les abonnements depuis Firebase (collection 'subscriptions')
      const subscriptionsSnapshot = await getDocs(
        collection(db, "subscriptions")
      );
      const subscriptions: any[] = [];

      subscriptionsSnapshot.forEach((doc) => {
        subscriptions.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Trier par date de création (plus récent en premier)
      subscriptions.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      const totalSubscriptions = subscriptions.length;
      const activeSubscriptions = subscriptions.filter(
        (sub) => sub.status === "active"
      ).length;

      // Calculer les revenus
      let monthlyRevenue = 0;
      let totalRevenue = 0;

      subscriptions.forEach((sub) => {
        if (sub.status === "active" && sub.amount) {
          const amount = typeof sub.amount === "number" ? sub.amount : 0;
          totalRevenue += amount;

          const createdDate = sub.createdAt?.toDate?.() || new Date(0);
          if (createdDate >= startOfMonth) {
            monthlyRevenue += amount;
          }
        }
      });

      // Calculer la croissance (simulé pour l'exemple)
      const subscriptionGrowth = totalSubscriptions > 0 ? 12.5 : 0;
      const revenueGrowth = totalRevenue > 0 ? 8.3 : 0;

      // Abonnements récents pour le tableau
      const recent: RecentSubscription[] = subscriptions
        .slice(0, 5)
        .map((sub) => ({
          id: sub.id,
          userId: sub.userId || "N/A",
          userEmail: sub.userEmail || "N/A",
          status: sub.status || "inactive",
          createdAt: sub.createdAt,
          amount: sub.amount || 0,
          interval: sub.interval || "month",
          method: sub.method || "stripe",
        }));

      setStats({
        totalUsers,
        totalSubscriptions,
        activeSubscriptions,
        monthlyRevenue,
        totalRevenue,
        newUsersThisMonth,
        journalsCount,
        subscriptionGrowth,
        revenueGrowth,
      });

      setRecentSubscriptions(recent);
    } catch (error) {
      console.error("Erreur chargement stats:", error);
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setLoadingStats(false);
    }
  };

  // État de chargement initial
  if (checking || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              Vérification des permissions...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // Accès refusé (ne devrait pas se produire grâce aux redirections)
  if (!user || userData?.role !== "ADMIN") {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Accès Refusé
            </h2>
            <p className="text-gray-600 mb-6">
              Vous devez être administrateur pour accéder à cette page.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-red-600 hover:bg-red-700"
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Format devise
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Badge statut
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      trialing: "bg-blue-100 text-blue-800",
      canceled: "bg-red-100 text-red-800",
      past_due: "bg-orange-100 text-orange-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          colors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Header utilisateur */}
        <UserHeader
          user={user}
          userRole={userData?.role}
          userName={`${userData?.prenom || ""} ${userData?.nom || ""}`}
        />

        {/* Container principal */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* En-tête du dashboard */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Tableau de Bord Administrateur
                </h1>
                <p className="text-gray-600">
                  Bienvenue, {userData?.prenom || "Admin"}
                </p>
              </div>
            </div>
          </div>

          {/* Cartes statistiques */}
          {loadingStats ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Utilisateurs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500">
                      +{stats?.newUsersThisMonth || 0} ce mois
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {stats?.totalUsers || 0}
                  </h3>
                  <p className="text-sm text-gray-600">Utilisateurs totaux</p>
                </div>

                {/* Abonnements actifs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex items-center text-green-600 text-xs font-semibold">
                      <ArrowUpRight className="w-4 h-4" />
                      {stats?.subscriptionGrowth || 0}%
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {stats?.activeSubscriptions || 0}
                  </h3>
                  <p className="text-sm text-gray-600">Abonnements actifs</p>
                  <p className="text-xs text-gray-400 mt-1">
                    sur {stats?.totalSubscriptions || 0} total
                  </p>
                </div>

                {/* Revenus mensuels */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex items-center text-purple-600 text-xs font-semibold">
                      <ArrowUpRight className="w-4 h-4" />
                      {stats?.revenueGrowth || 0}%
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {formatCurrency(stats?.monthlyRevenue || 0)}
                  </h3>
                  <p className="text-sm text-gray-600">Revenus ce mois</p>
                </div>

                {/* Journaux publiés */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Newspaper className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {stats?.journalsCount || 0}
                  </h3>
                  <p className="text-sm text-gray-600">Journaux publiés</p>
                </div>
              </div>

              {/* Revenus totaux */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-2">
                      Revenus Totaux
                    </p>
                    <h2 className="text-4xl font-bold mb-1">
                      {formatCurrency(stats?.totalRevenue || 0)}
                    </h2>
                    <p className="text-blue-100 text-sm">
                      Depuis le lancement de la plateforme
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Button
                  onClick={() => router.push("/admin/journal")}
                  className="h-auto py-6 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-blue-500 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Newspaper className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-base">
                        Gestion des Journaux
                      </p>
                      <p className="text-sm text-gray-600">
                        Créer et gérer les journaux
                      </p>
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => router.push("/admin/users")}
                  className="h-auto py-6 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-green-500 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-base">
                        Gestion Utilisateurs
                      </p>
                      <p className="text-sm text-gray-600">
                        Voir et gérer les utilisateurs
                      </p>
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => router.push("/admin/subscriptions")}
                  className="h-auto py-6 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-purple-500 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-base">
                        Gestion Abonnements
                      </p>
                      <p className="text-sm text-gray-600">
                        Voir et gérer les abonnements
                      </p>
                    </div>
                  </div>
                </Button>
              </div>

              {/* Tableau des abonnements récents */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Abonnements Récents
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Les 5 derniers abonnements
                      </p>
                    </div>
                    <Button
                      onClick={() => router.push("/admin/subscriptions")}
                      variant="outline"
                      size="sm"
                    >
                      Voir tout
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          ID Abonnement
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Utilisateur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Montant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Méthode
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Période
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentSubscriptions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            Aucun abonnement trouvé
                          </td>
                        </tr>
                      ) : (
                        recentSubscriptions.map((sub) => (
                          <tr
                            key={sub.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-mono text-gray-600">
                              {sub.id.substring(0, 20)}...
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {sub.userEmail}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {sub.userId.substring(0, 8)}...
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(sub.status)}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                              {formatCurrency(sub.amount)}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
                                {sub.method}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                              {sub.interval === "month"
                                ? "Mensuel"
                                : sub.interval === "year"
                                  ? "Annuel"
                                  : sub.interval === "semester"
                                    ? "Semestriel"
                                    : sub.interval}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {sub.createdAt?.toDate?.()
                                ? formatDate(
                                    sub.createdAt.toDate().toISOString()
                                  )
                                : "N/A"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
