import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "../../@/components/ui/button";
import {
  Check,
  Sparkles,
  Newspaper,
  Zap,
  CreditCard,
  Smartphone,
  Shield,
  Clock,
  TrendingUp,
  Award,
  Loader2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import Head from "next/head";
import Layout from "../../components/layout";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  features: string[];
  popular?: boolean;
  savings?: string;
  cinetpayEndpoint: string;
}

const plans: SubscriptionPlan[] = [
  {
    id: "monthly",
    name: "Mensuel",
    price: 2000,
    duration: "1 mois",
    description: "Parfait pour découvrir nos contenus",
    cinetpayEndpoint: "/api/subscription/init",
    features: [
      "Accès illimité aux articles premium",
      "Journal numérique quotidien",
      "Brèves en exclusivité",
      "Support client prioritaire",
      "Sans engagement",
    ],
  },
  {
    id: "semiannual",
    name: "Semestriel",
    price: 6500,
    duration: "6 mois",
    description: "Le meilleur rapport qualité-prix",
    cinetpayEndpoint: "/api/subscription/init",
    popular: true,
    savings: "Économisez 5 500 F CFA",
    features: [
      "Tous les avantages du mensuel",
      "1 mois gratuit inclus",
      "Accès archives complètes",
      "Notifications personnalisées",
      "Badge membre premium",
    ],
  },
  {
    id: "annual",
    name: "Annuel",
    price: 13000,
    duration: "12 mois",
    description: "L'abonnement des lecteurs assidus",
    cinetpayEndpoint: "/api/subscription/init",
    savings: "Économisez 11 000 F CFA",
    features: [
      "Tous les avantages du semestriel",
      "2 mois gratuits inclus",
      "Accès anticipé aux dossiers spéciaux",
      "Invitations événements exclusifs",
      "Assistance personnalisée 24/7",
    ],
  },
];

export default function AbonnementPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"mobile" | "card">(
    "mobile"
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      // Récupérer les données utilisateur si connecté
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error("Erreur récupération profil:", error);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    // Rediriger vers la page de connexion si pas authentifié
    if (!user) {
      toast.error("Veuillez vous connecter pour souscrire");
      router.push(`/connexion?redirect=/abonnement`);
      return;
    }

    if (!userData) {
      toast.error("Erreur de chargement du profil");
      return;
    }

    setSelectedPlan(plan.id);
    setProcessingPayment(true);

    try {
      // Normaliser le code pays pour qu'il soit exactement 2 caractères ISO
      let countryCode = userData.pays || "CI";
      // Si le pays est un nom complet, extraire le code
      if (countryCode.length > 2) {
        // Mapper les noms communs vers codes ISO
        const countryMap: Record<string, string> = {
          "Côte d'Ivoire": "CI",
          "Cote d'Ivoire": "CI",
          "Ivory Coast": "CI",
          Sénégal: "SN",
          Senegal: "SN",
          Togo: "TG",
          Bénin: "BJ",
          Benin: "BJ",
          Mali: "ML",
          "Burkina Faso": "BF",
          Niger: "NE",
          Cameroun: "CM",
          Cameroon: "CM",
          Gabon: "GA",
          Congo: "CG",
          Guinée: "GN",
          Guinea: "GN",
        };
        countryCode = countryMap[countryCode] || "CI";
      }
      // S'assurer que c'est exactement 2 caractères en majuscules
      countryCode = countryCode.substring(0, 2).toUpperCase();

      // Préparer les données client pour CinetPay
      const customerData = {
        customer_name: userData.nom || "",
        customer_surname: userData.prenom || "",
        customer_email: userData.email || user.email,
        customer_phone_number: userData.telephone || "+2250000000000",
        customer_address: userData.ville || "Abidjan",
        customer_city: userData.ville || "Abidjan",
        customer_country: countryCode,
        customer_state: countryCode,
        customer_zip_code: "00225",
      };

      // Préparer la requête d'abonnement
      const subscriptionRequest = {
        plan: plan.id,
        userId: user.uid,
        customer: customerData,
        metadata: {
          userEmail: user.email,
          userName: `${userData.prenom} ${userData.nom}`,
        },
      };

      console.log("🚀 Initialisation abonnement:", {
        plan: plan.name,
        amount: plan.price,
        userId: user.uid,
        country: customerData.customer_country,
      });

      // Appeler l'API d'abonnement moderne avec fetch
      const response = await fetch("/api/subscription/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscriptionRequest),
      });

      const data = await response.json();

      if (data.success && data.payment_url) {
        // Sauvegarder la transaction en cours dans Firestore
        await updateDoc(doc(db, "users", user.uid), {
          pendingSubscription: {
            planId: plan.id,
            planName: plan.name,
            amount: plan.price,
            duration: plan.duration,
            transactionId: data.transaction_id,
            createdAt: serverTimestamp(),
          },
        });

        toast.success("Redirection vers la page de paiement sécurisée...", {
          duration: 3000,
        });

        // Petit délai avant redirection pour que l'utilisateur voie le message
        setTimeout(() => {
          window.location.href = data.payment_url;
        }, 1000);
      } else {
        throw new Error(data.error || "URL de paiement non générée");
      }
    } catch (error: any) {
      console.error("❌ Erreur abonnement:", error);

      // Messages d'erreur personnalisés
      let errorMessage = "Erreur lors de l'initialisation du paiement";

      if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setProcessingPayment(false);
      setSelectedPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  // Vérifier si l'utilisateur a un abonnement actif
  const hasActiveSubscription =
    userData?.subscriptionStatus === "active" &&
    userData?.subscriptionEndDate &&
    new Date(userData.subscriptionEndDate.toDate()) > new Date();

  return (
    <Layout>
      <Head>
        <title>Abonnement Premium - Afrikipresse</title>
        <meta
          name="description"
          content="Accédez à tous nos contenus exclusifs avec l'abonnement premium Afrikipresse"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-red-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">Abonnement Premium</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
                L&apos;information de qualité
                <br />
                <span className="text-yellow-300">à portée de main</span>
              </h1>

              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Rejoignez des milliers de lecteurs qui font confiance à
                Afrikipresse pour une information fiable et exclusive sur
                l&apos;Afrique
              </p>

              {hasActiveSubscription && (
                <div className="inline-flex items-center gap-3 bg-green-500 px-6 py-3 rounded-full">
                  <Check className="w-6 h-6" />
                  <span className="font-bold text-lg">
                    Abonnement actif jusqu&apos;au{" "}
                    {new Date(
                      userData.subscriptionEndDate.toDate()
                    ).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Avantages Section */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-black text-center mb-12">
              Vos avantages premium
            </h2>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Newspaper className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  Articles en exclusivité
                </h3>
                <p className="text-gray-600">
                  Bénéficiez d&apos;un accès illimité à l&apos;ensemble du
                  contenu éditorial et savourez une information exhaustive ainsi
                  qu&apos;une analyse de haute qualité chaque jour.
                </p>
              </div>

              <div className="text-center p-6 rounded-2xl border-2 border-gray-100 hover:border-red-200 hover:shadow-lg transition-all">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <Smartphone className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  Journal version numérique
                </h3>
                <p className="text-gray-600">
                  Obtenez quotidiennement l&apos;édition numérique de notre
                  journal papier L&apos;Intelligent d&apos;Abidjan en format PDF
                  haute qualité.
                </p>
              </div>

              <div className="text-center p-6 rounded-2xl border-2 border-gray-100 hover:border-green-200 hover:shadow-lg transition-all">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  Brèves actualités du moment
                </h3>
                <p className="text-gray-600">
                  Recevez quotidiennement et en exclusivité un condensé de
                  l&apos;actualité du jour directement dans votre boîte mail.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Section */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Choisissez votre formule
              </h2>
              <p className="text-xl text-gray-600">
                Tous les plans incluent un accès complet à nos contenus premium
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-8 ${
                    plan.popular
                      ? "bg-gradient-to-br from-blue-600 to-red-600 text-white shadow-2xl scale-105"
                      : "bg-white border-2 border-gray-200 hover:border-blue-300 shadow-lg"
                  } transition-all duration-300`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full font-bold text-sm flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        Plus populaire
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3
                      className={`text-2xl font-black mb-2 ${plan.popular ? "text-white" : "text-gray-900"}`}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={`text-sm mb-4 ${plan.popular ? "text-blue-100" : "text-gray-600"}`}
                    >
                      {plan.description}
                    </p>

                    <div className="flex items-baseline justify-center gap-2 mb-2">
                      <span className="text-5xl font-black">
                        {plan.price.toLocaleString("fr-FR")}
                      </span>
                      <span className="text-xl font-semibold">F CFA</span>
                    </div>

                    <p
                      className={`text-sm font-medium ${plan.popular ? "text-blue-100" : "text-gray-600"}`}
                    >
                      pour {plan.duration}
                    </p>

                    {plan.savings && (
                      <div
                        className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-bold ${
                          plan.popular
                            ? "bg-yellow-400 text-gray-900"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        <TrendingUp className="w-4 h-4 inline mr-1" />
                        {plan.savings}
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check
                          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            plan.popular ? "text-yellow-400" : "text-green-600"
                          }`}
                        />
                        <span
                          className={`text-sm ${plan.popular ? "text-white" : "text-gray-700"}`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(plan)}
                    disabled={processingPayment || hasActiveSubscription}
                    className={`w-full py-6 text-lg font-bold ${
                      plan.popular
                        ? "bg-white text-blue-600 hover:bg-gray-100"
                        : "bg-gradient-to-r from-blue-600 to-red-600 text-white hover:from-blue-700 hover:to-red-700"
                    }`}
                  >
                    {processingPayment && selectedPlan === plan.id ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Traitement...
                      </>
                    ) : hasActiveSubscription ? (
                      "Abonnement actif"
                    ) : (
                      "S'abonner"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-black mb-8">
                Modes de paiement sécurisés
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all">
                  <Smartphone className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Mobile Money</h3>
                  <p className="text-gray-600 text-sm">
                    Orange Money, MTN Mobile Money, Moov Money, Wave
                  </p>
                </div>

                <div className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all">
                  <CreditCard className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Cartes bancaires</h3>
                  <p className="text-gray-600 text-sm">
                    Visa, Mastercard, cartes locales et internationales
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold">
                    Paiement sécurisé SSL
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-semibold">
                    Activation instantanée
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-semibold">Sans engagement</span>
                </div>
              </div>

              <div className="mt-8 p-6 bg-blue-50 rounded-xl">
                <p className="text-sm text-gray-700">
                  <Shield className="w-4 h-4 inline text-blue-600 mr-2" />
                  Paiements traités par <strong>CinetPay</strong>, solution de
                  paiement certifiée et sécurisée pour l&apos;Afrique. Vos
                  données bancaires sont cryptées et protégées.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-black text-center mb-12">
                Questions fréquentes
              </h2>

              <div className="space-y-6">
                <details className="group bg-white p-6 rounded-xl shadow-md">
                  <summary className="font-bold text-lg cursor-pointer flex items-center justify-between">
                    Comment fonctionne l&apos;abonnement ?
                    <span className="text-blue-600 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <p className="mt-4 text-gray-600">
                    Après paiement, votre accès premium est activé
                    immédiatement. Vous pouvez accéder à tous les contenus
                    exclusifs depuis n&apos;importe quel appareil.
                  </p>
                </details>

                <details className="group bg-white p-6 rounded-xl shadow-md">
                  <summary className="font-bold text-lg cursor-pointer flex items-center justify-between">
                    Puis-je annuler mon abonnement ?
                    <span className="text-blue-600 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <p className="mt-4 text-gray-600">
                    Oui, vous pouvez annuler à tout moment depuis votre compte.
                    Aucun renouvellement automatique - vous gardez l&apos;accès
                    jusqu&apos;à la fin de votre période payée.
                  </p>
                </details>

                <details className="group bg-white p-6 rounded-xl shadow-md">
                  <summary className="font-bold text-lg cursor-pointer flex items-center justify-between">
                    Quels sont les modes de paiement acceptés ?
                    <span className="text-blue-600 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <p className="mt-4 text-gray-600">
                    Nous acceptons tous les moyens de paiement mobiles (Orange
                    Money, MTN, Moov, Wave) et les cartes bancaires via notre
                    partenaire sécurisé CinetPay.
                  </p>
                </details>

                <details className="group bg-white p-6 rounded-xl shadow-md">
                  <summary className="font-bold text-lg cursor-pointer flex items-center justify-between">
                    Puis-je partager mon compte ?
                    <span className="text-blue-600 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <p className="mt-4 text-gray-600">
                    Votre abonnement est personnel et limité à un seul
                    utilisateur. Le partage de compte peut entraîner la
                    suspension de votre accès.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
