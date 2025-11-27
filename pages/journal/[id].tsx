"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../../components/layout";
import Container from "../../components/container";
import { Meta } from "../../components/meta";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Crown,
  ArrowLeft,
  Calendar,
  FileText,
  Download,
  CheckCircle2,
  Loader2,
  CreditCard,
  Smartphone,
} from "lucide-react";
import { db, storage } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";

interface Journal {
  id: string;
  title: string | null;
  coverImage: string | null;
  created_at: string;
  annee: string | null;
  pdfPath: string | null;
  downloadURL?: string | null;
  filename?: string | null;
  uploadedAt: any;
}

export default function JournalDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [journal, setJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchJournal = async () => {
      try {
        setLoading(true);

        // Chercher dans les différentes années
        const currentYear = new Date().getFullYear().toString();
        const years = Array.from({ length: 16 }, (_, i) =>
          (parseInt(currentYear) - i).toString()
        );

        for (const year of years) {
          try {
            const docRef = doc(db, "archives", "pdf", year, id as string);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              const data = docSnap.data();
              let downloadUrl = data.downloadURL;

              try {
                const storagePath = `archives/pdf/${year}/${id}`;
                const storageRef = ref(storage, storagePath);
                downloadUrl = await getDownloadURL(storageRef);
              } catch (error) {
                console.warn(`URL non disponible pour ${id}`);
              }

              setJournal({
                id: docSnap.id,
                title:
                  data.title ||
                  `Journal du ${new Date(data.uploadedAt?.toDate()).toLocaleDateString("fr-FR")}`,
                coverImage: data.coverImage || null,
                created_at:
                  data.uploadedAt?.toDate().toISOString() ||
                  new Date().toISOString(),
                annee: year,
                pdfPath: data.pdfPath || null,
                downloadURL: downloadUrl,
                filename: data.filename || null,
                uploadedAt: data.uploadedAt,
              });
              break;
            }
          } catch (error) {
            console.warn(`Erreur pour l'année ${year}`);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement du journal:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJournal();
  }, [id]);

  const handlePurchase = async () => {
    setPurchasing(true);
    // TODO: Implémenter la logique d'achat avec CinetPay
    // Pour l'instant, rediriger vers la page de paiement
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push("/mobile-payment");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Layout>
        <Container>
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
          </div>
        </Container>
      </Layout>
    );
  }

  if (!journal) {
    return (
      <Layout>
        <Container>
          <div className="py-20 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Journal introuvable
            </h1>
            <p className="text-gray-600 mb-6">
              Ce journal n'existe pas ou a été supprimé.
            </p>
            <Link
              href="/journaux"
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour aux archives
            </Link>
          </div>
        </Container>
      </Layout>
    );
  }

  return (
    <div>
      <Meta
        postTitle={`${journal.title} - Afrikipresse`}
        ogImage={
          journal.coverImage || "https://www.afrikipresse.fr/default.png"
        }
        postExcerptDecoded={`Achetez l'édition numérique du journal ${journal.title}`}
        postTags="journal, PDF, édition numérique"
        ogUrl={`https://www.afrikipresse.fr/journal/${journal.id}`}
        publishedTime={journal.created_at}
        articleAuthor="Afrikipresse"
        articleSection="Journaux"
      />
      <Layout>
        <Container>
          <div className="py-8">
            {/* Breadcrumb */}
            <Link
              href="/journaux"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux archives
            </Link>

            {/* Contenu principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Colonne gauche - Image du journal */}
              <div className="lg:col-span-2">
                <div className="relative h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
                  {journal.coverImage ? (
                    <Image
                      src={journal.coverImage}
                      alt={journal.title || "Journal"}
                      fill
                      className="object-contain"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="w-32 h-32 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Informations détaillées */}
                <div className="mt-8 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      À propos de cette édition
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm font-semibold">
                            Date de publication
                          </span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          {formatDate(journal.created_at)}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm font-semibold">Format</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          PDF Numérique
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Ce qui est inclus
                    </h3>
                    <ul className="space-y-2 text-blue-800">
                      <li className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        <span>Téléchargement immédiat après paiement</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>Accès illimité au PDF</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Qualité d'impression haute résolution</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Colonne droite - Achat */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {/* Carte d'achat */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2">
                      {journal.title}
                    </h1>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-bold text-gray-900">
                          500
                        </span>
                        <span className="text-xl text-gray-600">XOF</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Achat unique - Accès à vie
                      </p>
                    </div>

                    <button
                      onClick={handlePurchase}
                      disabled={purchasing}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2 mb-4"
                    >
                      {purchasing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Traitement...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5" />
                          Acheter maintenant
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        <span>Carte bancaire</span>
                      </div>
                      <div className="w-1 h-1 bg-gray-300 rounded-full" />
                      <div className="flex items-center gap-1">
                        <Smartphone className="w-4 h-4" />
                        <span>Mobile Money</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-xs text-gray-500 text-center mb-3">
                        Paiement 100% sécurisé
                      </p>
                    </div>
                  </div>

                  {/* Carte abonnement */}
                  <div className="bg-gradient-to-br from-red-950 via-black to-gray-900 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-2 mb-4">
                      <Crown className="w-6 h-6 text-yellow-400" />
                      <h3 className="text-xl font-bold">
                        Économisez avec l'abonnement
                      </h3>
                    </div>

                    <p className="text-gray-300 text-sm mb-4">
                      Accédez à tous les journaux depuis 2009 pour seulement
                      5.000 XOF/mois
                    </p>

                    <ul className="space-y-2 mb-6 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span>Plus de 5000 éditions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span>Nouveaux journaux chaque jour</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span>Sans engagement</span>
                      </li>
                    </ul>

                    <Link
                      href="/abonnement"
                      className="block w-full bg-white text-gray-900 font-semibold py-3 px-6 rounded-xl text-center hover:bg-gray-100 transition-colors"
                    >
                      Voir les abonnements
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Layout>
    </div>
  );
}
