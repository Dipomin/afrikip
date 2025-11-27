import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout";
import { useAuth, useSubscription } from "../../hooks/useAuth";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import { signOut } from "firebase/auth";
import {
  User,
  CreditCard,
  BookOpen,
  ShoppingBag,
  Settings,
  LogOut,
  Calendar,
  Download,
  Check,
  X,
  AlertCircle,
  TrendingUp,
  Package,
  Eye,
  Loader2,
} from "lucide-react";
import Image from "next/image";

interface Order {
  id: string;
  transactionId: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  items: Array<{
    id: string;
    title: string;
    coverImageURL: string;
    price: number;
  }>;
  total: number;
  status: "pending" | "paid" | "failed";
  createdAt: any;
  paidAt?: any;
}

type TabType = "overview" | "profile" | "subscription" | "purchases" | "orders";

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading: subLoading } = useSubscription();

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [profile, setProfile] = useState({
    email: "",
    full_name: "",
    avatar_url: "",
  });

  // Rediriger si non connecté
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/connexion?redirect=/dashboard");
    }
  }, [user, authLoading, router]);

  // Charger les commandes
  useEffect(() => {
    if (user) {
      loadOrders();
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfile({
          email: data.email || user.email || "",
          full_name: data.full_name || "",
          avatar_url: data.avatar_url || "",
        });
      } else {
        setProfile({
          email: user.email || "",
          full_name: "",
          avatar_url: "",
        });
      }
    } catch (error) {
      console.error("Erreur chargement profil:", error);
      setProfile({
        email: user.email || "",
        full_name: "",
        avatar_url: "",
      });
    }
  };

  const loadOrders = async () => {
    if (!user) return;

    setLoadingOrders(true);
    try {
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef,
        where("customer.email", "==", user.email),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      const ordersData: Order[] = [];

      snapshot.forEach((doc) => {
        ordersData.push({
          id: doc.id,
          ...doc.data(),
        } as Order);
      });

      setOrders(ordersData);
    } catch (error) {
      console.error("Erreur chargement commandes:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  const getPurchasedPDFs = () => {
    return orders
      .filter((order) => order.status === "paid")
      .flatMap((order) => order.items);
  };

  const getSubscriptionStatus = () => {
    if (!subscription) return null;

    const status = subscription.status;
    const endDate = new Date(subscription.current_period_end);
    const daysLeft = Math.ceil(
      (endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return {
      isActive: ["active", "trialing"].includes(status),
      status,
      endDate,
      daysLeft,
      planName: subscription.prices?.products?.name || "Abonnement",
      price: subscription.prices?.unit_amount
        ? subscription.prices.unit_amount / 100
        : 0,
      interval: subscription.prices?.interval || "month",
    };
  };

  if (authLoading || subLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const subscriptionStatus = getSubscriptionStatus();
  const purchasedPDFs = getPurchasedPDFs();
  const paidOrders = orders.filter((o) => o.status === "paid");
  const totalSpent = paidOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-600 via-red-600 to-blue-700 text-white">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Avatar"
                    width={96}
                    height={96}
                    className="rounded-full"
                  />
                ) : (
                  <User className="w-12 h-12" />
                )}
              </div>
              <div>
                <h1 className="text-4xl font-black mb-2">
                  {profile.full_name || "Bienvenue"}
                </h1>
                <p className="text-blue-100">{profile.email}</p>
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-8 h-8" />
                  <div>
                    <p className="text-2xl font-black">
                      {purchasedPDFs.length}
                    </p>
                    <p className="text-blue-100 text-sm">PDFs achetés</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-8 h-8" />
                  <div>
                    <p className="text-2xl font-black">{paidOrders.length}</p>
                    <p className="text-blue-100 text-sm">Commandes</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-8 h-8" />
                  <div>
                    <p className="text-2xl font-black">
                      {totalSpent.toLocaleString()} F
                    </p>
                    <p className="text-blue-100 text-sm">Total dépensé</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="flex items-center gap-3">
                  {subscriptionStatus?.isActive ? (
                    <Check className="w-8 h-8 text-green-300" />
                  ) : (
                    <X className="w-8 h-8 text-red-300" />
                  )}
                  <div>
                    <p className="text-lg font-black">
                      {subscriptionStatus?.isActive ? "Actif" : "Inactif"}
                    </p>
                    <p className="text-blue-100 text-sm">Abonnement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-1 overflow-x-auto">
              {[
                { id: "overview", label: "Vue d'ensemble", icon: Eye },
                { id: "profile", label: "Profil", icon: User },
                { id: "subscription", label: "Abonnement", icon: CreditCard },
                { id: "purchases", label: "Mes PDFs", icon: BookOpen },
                { id: "orders", label: "Commandes", icon: ShoppingBag },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Abonnement */}
              {subscriptionStatus && (
                <div
                  className={`rounded-2xl p-8 border-2 ${
                    subscriptionStatus.isActive
                      ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                      : "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 mb-2">
                        Votre abonnement
                      </h2>
                      <p className="text-gray-600">
                        {subscriptionStatus.isActive
                          ? `Actif - ${subscriptionStatus.planName}`
                          : "Aucun abonnement actif"}
                      </p>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-full font-bold ${
                        subscriptionStatus.isActive
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      {subscriptionStatus.status}
                    </div>
                  </div>

                  {subscriptionStatus.isActive && (
                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Prix</p>
                        <p className="text-2xl font-black text-gray-900">
                          {subscriptionStatus.price.toLocaleString()} F CFA
                          <span className="text-sm text-gray-600 font-normal">
                            /
                            {subscriptionStatus.interval === "month"
                              ? "mois"
                              : "an"}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Expire le</p>
                        <p className="text-lg font-bold text-gray-900">
                          {subscriptionStatus.endDate.toLocaleDateString(
                            "fr-FR"
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Jours restants
                        </p>
                        <p className="text-2xl font-black text-gray-900">
                          {subscriptionStatus.daysLeft}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => router.push("/abonnement")}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      {subscriptionStatus.isActive
                        ? "Gérer l'abonnement"
                        : "S'abonner"}
                    </button>
                    {subscriptionStatus.isActive &&
                      subscriptionStatus.interval === "month" && (
                        <button
                          onClick={() => router.push("/abonnement")}
                          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold flex items-center gap-2"
                        >
                          <TrendingUp className="w-5 h-5" />
                          Passer à l'abonnement annuel
                        </button>
                      )}
                  </div>
                </div>
              )}

              {!subscriptionStatus && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200">
                  <AlertCircle className="w-12 h-12 text-blue-600 mb-4" />
                  <h2 className="text-2xl font-black text-gray-900 mb-2">
                    Accès illimité aux journaux
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Abonnez-vous pour accéder à tous les numéros de
                    L'Intelligent d'Abidjan
                  </p>
                  <button
                    onClick={() => router.push("/abonnement")}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Découvrir nos offres
                  </button>
                </div>
              )}

              {/* Derniers achats */}
              {purchasedPDFs.length > 0 && (
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-6">
                    Derniers achats
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {purchasedPDFs.slice(0, 4).map((pdf, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          router.push(`/lintelligentpdf/read/${pdf.id}`)
                        }
                        className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden"
                      >
                        <div className="relative aspect-[3/4]">
                          <Image
                            src={pdf.coverImageURL}
                            alt={pdf.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="p-3">
                          <p className="font-bold text-sm line-clamp-2">
                            {pdf.title}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6">
                  Informations personnelles
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={profile.full_name}
                      onChange={(e) =>
                        setProfile({ ...profile, full_name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                    Mettre à jour le profil
                  </button>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold"
                  >
                    <LogOut className="w-5 h-5" />
                    Se déconnecter
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "subscription" && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6">
                  Gérer l'abonnement
                </h2>

                {subscriptionStatus?.isActive ? (
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Check className="w-6 h-6 text-green-600" />
                        <h3 className="text-xl font-black text-gray-900">
                          Abonnement actif
                        </h3>
                      </div>
                      <p className="text-gray-700 mb-4">
                        Votre abonnement vous donne accès à tous les numéros de
                        L'Intelligent d'Abidjan.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Formule</p>
                          <p className="text-lg font-bold">
                            {subscriptionStatus.planName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Prochain renouvellement
                          </p>
                          <p className="text-lg font-bold">
                            {subscriptionStatus.endDate.toLocaleDateString(
                              "fr-FR"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => router.push("/account")}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                          Gérer sur Stripe
                        </button>
                        {subscriptionStatus.interval === "month" && (
                          <button
                            onClick={() => router.push("/abonnement")}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                          >
                            Passer à l'annuel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-gray-900 mb-2">
                      Aucun abonnement actif
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Abonnez-vous pour accéder à tous les journaux
                    </p>
                    <button
                      onClick={() => router.push("/abonnement")}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Voir les offres
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "purchases" && (
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-6">
                Mes PDFs achetés
              </h2>
              {purchasedPDFs.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-xl">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-gray-900 mb-2">
                    Aucun achat pour le moment
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Parcourez notre boutique pour acheter des numéros
                  </p>
                  <button
                    onClick={() => router.push("/lintelligentpdf")}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Parcourir la boutique
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {purchasedPDFs.map((pdf, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-lg overflow-hidden group"
                    >
                      <div className="relative aspect-[3/4]">
                        <Image
                          src={pdf.coverImageURL}
                          alt={pdf.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-sm mb-3 line-clamp-2">
                          {pdf.title}
                        </h3>
                        <button
                          onClick={() =>
                            router.push(`/lintelligentpdf/read/${pdf.id}`)
                          }
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
                        >
                          <BookOpen className="w-4 h-4" />
                          Lire
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-6">
                Historique des commandes
              </h2>
              {loadingOrders ? (
                <div className="text-center py-20">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-xl">
                  <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-gray-900 mb-2">
                    Aucune commande
                  </h3>
                  <p className="text-gray-600">
                    Vos commandes apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Commande #{order.transactionId}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.createdAt
                              ?.toDate?.()
                              ?.toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-bold ${
                            order.status === "paid"
                              ? "bg-green-100 text-green-700"
                              : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {order.status === "paid"
                            ? "Payée"
                            : order.status === "pending"
                              ? "En attente"
                              : "Échouée"}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 bg-gray-50 rounded-lg p-2"
                          >
                            <div className="relative w-12 h-16">
                              <Image
                                src={item.coverImageURL}
                                alt={item.title}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                            <span className="text-sm font-semibold">
                              {item.title}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <p className="text-lg font-black text-gray-900">
                          {order.total.toLocaleString()} F CFA
                        </p>
                        {order.status === "paid" && (
                          <button
                            onClick={() =>
                              router.push(`/order-success?orderId=${order.id}`)
                            }
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                          >
                            Voir détails
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
