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
  orderBy,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import UserHeader from "../../components/UserHeader";
import Layout from "../../components/layout";
import {
  CreditCard,
  Search,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "../../@/components/ui/button";
import toast from "react-hot-toast";

interface UserData {
  role?: string;
  nom?: string;
  prenom?: string;
}

interface Subscription {
  id: string;
  userId: string;
  userEmail: string;
  status: string;
  createdAt: any;
  currentPeriodStart: any;
  currentPeriodEnd: any;
  cancelAtPeriodEnd: boolean;
  canceledAt: any | null;
  amount: number;
  interval: string;
  currency: string;
  method: string;
}

interface SubscriptionStats {
  total: number;
  active: number;
  trialing: number;
  canceled: number;
  past_due: number;
  totalRevenue: number;
  monthlyRecurring: number;
}

export default function SubscriptionsManagement() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState<SubscriptionStats>({
    total: 0,
    active: 0,
    trialing: 0,
    canceled: 0,
    past_due: 0,
    totalRevenue: 0,
    monthlyRecurring: 0,
  });
  const subsPerPage = 10;

  // Vérification authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setChecking(true);

      if (!currentUser) {
        toast.error("Vous devez être connecté pour accéder à cette page");
        router.push("/connexion?redirect=/admin/subscriptions");
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
          router.push("/");
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

  // Chargement des abonnements
  useEffect(() => {
    if (user && userData?.role === "ADMIN") {
      loadSubscriptions();
    }
  }, [user, userData]);

  const loadSubscriptions = async () => {
    setLoadingSubs(true);
    try {
      // Charger depuis Firebase Firestore
      const subscriptionsSnapshot = await getDocs(
        collection(db, "subscriptions")
      );
      const subsData: Subscription[] = [];

      subscriptionsSnapshot.forEach((doc) => {
        subsData.push({
          id: doc.id,
          ...doc.data(),
        } as Subscription);
      });

      // Trier par date de création (plus récent en premier)
      subsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setSubscriptions(subsData);

      // Calculer les statistiques
      const total = subsData.length;
      const active = subsData.filter((s) => s.status === "active").length;
      const trialing = subsData.filter((s) => s.status === "trialing").length;
      const canceled = subsData.filter((s) => s.status === "canceled").length;
      const past_due = subsData.filter((s) => s.status === "past_due").length;

      let totalRevenue = 0;
      let monthlyRecurring = 0;

      subsData.forEach((sub) => {
        if (sub.status === "active" && sub.amount) {
          const amount = sub.amount;
          totalRevenue += amount;
          if (sub.interval === "month") {
            monthlyRecurring += amount;
          } else if (sub.interval === "year") {
            monthlyRecurring += amount / 12;
          } else if (sub.interval === "semester") {
            monthlyRecurring += amount / 6;
          }
        }
      });

      setStats({
        total,
        active,
        trialing,
        canceled,
        past_due,
        totalRevenue,
        monthlyRecurring,
      });
    } catch (error) {
      console.error("Erreur chargement abonnements:", error);
      toast.error("Erreur lors du chargement des abonnements");
    } finally {
      setLoadingSubs(false);
    }
  };

  // Filtrage et recherche
  const filteredSubs = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || sub.status === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSubs.length / subsPerPage);
  const startIndex = (currentPage - 1) * subsPerPage;
  const endIndex = startIndex + subsPerPage;
  const currentSubs = filteredSubs.slice(startIndex, endIndex);

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
    const badges: Record<
      string,
      { color: string; icon: React.ReactNode; label: string }
    > = {
      active: {
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle className="w-3 h-3" />,
        label: "Actif",
      },
      trialing: {
        color: "bg-blue-100 text-blue-800",
        icon: <Clock className="w-3 h-3" />,
        label: "Essai",
      },
      canceled: {
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="w-3 h-3" />,
        label: "Annulé",
      },
      past_due: {
        color: "bg-orange-100 text-orange-800",
        icon: <AlertTriangle className="w-3 h-3" />,
        label: "Impayé",
      },
      incomplete: {
        color: "bg-gray-100 text-gray-800",
        icon: <Ban className="w-3 h-3" />,
        label: "Incomplet",
      },
    };

    const badge = badges[status] || badges.incomplete;

    return (
      <span
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}
      >
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "ID Abonnement",
      "User ID",
      "Email",
      "Statut",
      "Montant",
      "Période",
      "Devise",
      "Méthode",
      "Début période",
      "Fin période",
      "Annulation programmée",
      "Date création",
    ];
    const rows = filteredSubs.map((sub) => [
      sub.id,
      sub.userId,
      sub.userEmail,
      sub.status,
      sub.amount?.toString() || "0",
      sub.interval || "",
      sub.currency || "EUR",
      sub.method || "stripe",
      sub.currentPeriodStart?.toDate?.()?.toISOString() || "",
      sub.currentPeriodEnd?.toDate?.()?.toISOString() || "",
      sub.cancelAtPeriodEnd ? "Oui" : "Non",
      sub.createdAt?.toDate?.()?.toISOString() || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `abonnements_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <UserHeader
          user={user}
          userRole={userData?.role}
          userName={`${userData?.prenom || ""} ${userData?.nom || ""}`}
        />

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => router.push("/admin")}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Retour
                </Button>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Gestion des Abonnements
                  </h1>
                  <p className="text-gray-600">
                    {filteredSubs.length} abonnement(s) trouvé(s)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={loadSubscriptions}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualiser
                </Button>
                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exporter CSV
                </Button>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.total}
                    </p>
                  </div>
                  <CreditCard className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-xs text-gray-500">Tous les abonnements</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-600">Actifs</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.active}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-xs text-gray-500">
                  {stats.trialing > 0 && `${stats.trialing} en essai`}
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-600">MRR</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(stats.monthlyRecurring)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-xs text-gray-500">
                  Revenus récurrents mensuels
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-600">Revenus totaux</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-xs text-gray-500">Depuis le début</p>
              </div>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par ID abonnement ou utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="ALL">Tous les statuts</option>
                    <option value="ACTIVE">Actifs</option>
                    <option value="TRIALING">En essai</option>
                    <option value="CANCELED">Annulés</option>
                    <option value="PAST_DUE">Impayés</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau */}
          {loadingSubs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
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
                          Période
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Fin période
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Création
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentSubs.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            Aucun abonnement trouvé
                          </td>
                        </tr>
                      ) : (
                        currentSubs.map((sub) => (
                          <tr
                            key={sub.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-mono text-gray-600">
                              {sub.id.substring(0, 18)}...
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {sub.userEmail}
                                </p>
                                <p className="text-xs text-gray-500 font-mono">
                                  {sub.userId.substring(0, 8)}...
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(sub.status)}
                              {sub.cancelAtPeriodEnd && (
                                <p className="text-xs text-orange-600 mt-1">
                                  Annulation programmée
                                </p>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                              {formatCurrency(sub.amount || 0)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                              {sub.interval === "month"
                                ? "Mensuel"
                                : sub.interval === "year"
                                  ? "Annuel"
                                  : sub.interval === "semester"
                                    ? "Semestriel"
                                    : sub.interval || "N/A"}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                {sub.currentPeriodEnd?.toDate?.()
                                  ? formatDate(
                                      sub.currentPeriodEnd
                                        .toDate()
                                        .toISOString()
                                    )
                                  : "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {sub.createdAt?.toDate?.()
                                ? formatDate(
                                    sub.createdAt.toDate().toISOString()
                                  )
                                : "N/A"}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
                                  {sub.method || "stripe"}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-6 py-4">
                  <p className="text-sm text-gray-600">
                    Page {currentPage} sur {totalPages} ({filteredSubs.length}{" "}
                    résultats)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Précédent
                    </Button>
                    <Button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Suivant
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
