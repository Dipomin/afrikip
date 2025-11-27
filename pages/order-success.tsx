import React, { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Layout from "../components/layout";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  CheckCircle,
  Download,
  Mail,
  FileText,
  Clock,
  XCircle,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface OrderItem {
  id: string;
  title: string;
  issueNumber: string;
  coverImageURL: string;
  pdfURL: string;
  price: number;
  year: string;
}

interface OrderData {
  transactionId: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  total: number;
  status: string;
  paymentStatus?: string;
  createdAt: any;
  paidAt?: any;
}

export default function OrderSuccessPage() {
  const router = useRouter();
  const { orderId, transactionId } = router.query;
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const orderRef = doc(db, "orders", orderId as string);
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists()) {
        setError("Commande introuvable");
        return;
      }

      setOrder(orderSnap.data() as OrderData);
    } catch (err) {
      console.error("Erreur chargement commande:", err);
      setError("Erreur lors du chargement de la commande");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleDownload = async (pdfURL: string, title: string) => {
    try {
      const response = await fetch(pdfURL);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erreur téléchargement:", error);
      alert("Erreur lors du téléchargement. Veuillez réessayer.");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-xl text-gray-600">
              Chargement de votre commande...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">
              Commande introuvable
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "Cette commande n'existe pas"}
            </p>
            <Link
              href="/lintelligentpdf/aujourdhui"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Retour aux journaux
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const isPaid = order.status === "paid";
  const isPending = order.status === "pending";
  const isFailed = order.status === "failed";

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-6">
          {/* En-tête de statut */}
          <div
            className={`rounded-2xl shadow-xl p-8 mb-8 text-center ${
              isPaid
                ? "bg-gradient-to-r from-green-500 to-emerald-600"
                : isPending
                  ? "bg-gradient-to-r from-yellow-500 to-orange-600"
                  : "bg-gradient-to-r from-red-500 to-rose-600"
            } text-white`}
          >
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              {isPaid ? (
                <CheckCircle className="w-12 h-12" />
              ) : isPending ? (
                <Clock className="w-12 h-12" />
              ) : (
                <XCircle className="w-12 h-12" />
              )}
            </div>
            <h1 className="text-4xl font-black mb-3">
              {isPaid
                ? "Paiement réussi !"
                : isPending
                  ? "Paiement en attente"
                  : "Paiement échoué"}
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {isPaid
                ? "Votre commande a été confirmée avec succès"
                : isPending
                  ? "Votre paiement est en cours de traitement"
                  : "Le paiement n'a pas pu être effectué"}
            </p>
            <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <p className="text-sm text-white/80 mb-1">Numéro de commande</p>
              <p className="text-xl font-black">{order.transactionId}</p>
            </div>
          </div>

          {/* Détails de la commande */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-200">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <FileText className="w-7 h-7 text-blue-600" />
              Détails de la commande
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-sm text-gray-600 mb-1">Client</p>
                <p className="text-lg font-bold text-gray-900">
                  {order.customer.firstName} {order.customer.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="text-lg font-bold text-gray-900">
                  {order.customer.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Téléphone</p>
                <p className="text-lg font-bold text-gray-900">
                  {order.customer.phone}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Montant total</p>
                <p className="text-2xl font-black text-blue-600">
                  {order.total.toLocaleString()} F CFA
                </p>
              </div>
            </div>

            {/* Articles commandés */}
            <div className="border-t-2 border-gray-200 pt-6">
              <h3 className="text-xl font-black text-gray-900 mb-4">
                Journaux commandés ({order.items.length})
              </h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={item.coverImageURL}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {item.issueNumber}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-blue-600">
                          {item.price.toLocaleString()} F CFA
                        </span>
                        {isPaid && (
                          <button
                            onClick={() =>
                              handleDownload(item.pdfURL, item.title)
                            }
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                          >
                            <Download className="w-4 h-4" />
                            <span>Télécharger</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Message en fonction du statut */}
          {isPaid && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-green-900 mb-2">
                    Email de confirmation envoyé
                  </h3>
                  <p className="text-green-800 mb-3">
                    Un email contenant les liens de téléchargement a été envoyé
                    à <strong>{order.customer.email}</strong>
                  </p>
                  <p className="text-sm text-green-700">
                    Vous pouvez télécharger vos journaux directement depuis
                    cette page ou via le lien dans l'email.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isPending && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-yellow-900 mb-2">
                    Paiement en cours de validation
                  </h3>
                  <p className="text-yellow-800 mb-3">
                    Votre paiement est en cours de traitement. Vous recevrez un
                    email de confirmation dès que le paiement sera validé.
                  </p>
                  <button
                    onClick={loadOrder}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
                  >
                    Actualiser le statut
                  </button>
                </div>
              </div>
            </div>
          )}

          {isFailed && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-red-900 mb-2">
                    Paiement échoué
                  </h3>
                  <p className="text-red-800 mb-3">
                    Le paiement n'a pas pu être effectué. Veuillez réessayer ou
                    contacter notre support.
                  </p>
                  <Link
                    href="/checkout"
                    className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                  >
                    Réessayer le paiement
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/lintelligentpdf/aujourdhui"
              className="flex-1 bg-gradient-to-r from-blue-600 to-red-600 text-white py-4 rounded-xl font-black text-center hover:shadow-xl transition-all"
            >
              Parcourir plus de journaux
            </Link>
            {isPaid && (
              <button
                onClick={() => window.print()}
                className="flex-1 bg-white border-2 border-gray-300 text-gray-900 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all"
              >
                Imprimer le reçu
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
