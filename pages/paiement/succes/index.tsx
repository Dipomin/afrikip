import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { CheckCircle, Loader2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "../../../@/components/ui/button";
import Link from "next/link";
import Head from "next/head";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSubscription = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          router.push("/connexion");
          return;
        }

        try {
          // Attendre 2 secondes pour laisser le temps au webhook de s'exécuter
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();

            if (userData.subscriptionStatus === "active") {
              setSubscription({
                type: userData.subscriptionType,
                endDate: userData.subscriptionEndDate,
                startDate: userData.subscriptionStartDate,
              });
            } else {
              setError(
                "L'abonnement n'a pas encore été activé. Veuillez patienter..."
              );
              // Réessayer après 3 secondes
              setTimeout(() => {
                window.location.reload();
              }, 3000);
            }
          }
        } catch (err) {
          console.error("Erreur vérification abonnement:", err);
          setError("Erreur lors de la vérification de votre abonnement");
        } finally {
          setLoading(false);
        }
      });

      return () => unsubscribe();
    };

    checkSubscription();
  }, [router]);

  if (loading) {
    return (
      <>
        <Head>
          <title>Vérification du paiement... - Afrikipresse</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-red-50">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Vérification de votre paiement...
            </h2>
            <p className="text-gray-600">
              Veuillez patienter quelques instants
            </p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Erreur - Afrikipresse</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-red-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Oups ! Une erreur s&apos;est produite
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Réessayer
              </Button>
              <Link href="/abonnement">
                <Button variant="outline" className="w-full">
                  Retour aux abonnements
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const getPlanName = (type: string) => {
    switch (type) {
      case "monthly":
        return "Mensuel";
      case "semiannual":
        return "Semestriel";
      case "annual":
        return "Annuel";
      default:
        return type;
    }
  };

  return (
    <>
      <Head>
        <title>Abonnement activé ! - Afrikipresse</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-red-50 p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header avec animation */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 animate-bounce">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">
              Paiement réussi !
            </h1>
            <p className="text-green-100 text-lg">
              Votre abonnement premium a été activé avec succès
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="mb-8 p-6 bg-blue-50 rounded-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Détails de votre abonnement
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Formule :</span>
                  <span className="font-bold text-gray-900">
                    {subscription && getPlanName(subscription.type)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    Date d&apos;activation :
                  </span>
                  <span className="font-bold text-gray-900">
                    {subscription &&
                      new Date(
                        subscription.startDate?.toDate()
                      ).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Valable jusqu&apos;au :</span>
                  <span className="font-bold text-green-600">
                    {subscription &&
                      new Date(
                        subscription.endDate?.toDate()
                      ).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h3 className="font-bold text-lg text-gray-900">
                Vous pouvez maintenant :
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Accéder à tous les articles premium et analyses exclusives
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Télécharger le journal numérique quotidien
                    L&apos;Intelligent d&apos;Abidjan
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Recevoir les brèves d&apos;actualité en exclusivité
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link href="/lintelligentpdf/list">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white font-bold py-6 text-lg">
                  Commencer à lire
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Retour à l&apos;accueil
                </Button>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-6 text-center border-t">
            <p className="text-sm text-gray-600">
              Une confirmation a été envoyée à votre adresse email.
              <br />
              Besoin d&apos;aide ? Contactez-nous à{" "}
              <a
                href="mailto:support@afrikipresse.fr"
                className="text-blue-600 hover:underline"
              >
                support@afrikipresse.fr
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
