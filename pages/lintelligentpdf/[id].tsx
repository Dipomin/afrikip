import React from "react";
import { GetServerSideProps } from "next";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import Layout from "../../components/layout";
import { useAuth, useSubscription, usePDFAccess } from "../../hooks/useAuth";
import { useCart } from "../../contexts/CartContext";
import {
  Newspaper,
  Calendar,
  Eye,
  Download,
  Tag,
  ShoppingCart,
  Check,
  Lock,
  Unlock,
  CreditCard,
  ArrowRight,
  Book,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";

interface PDFData {
  id: string;
  title: string;
  issueNumber: string;
  publicationDate: string;
  description?: string;
  tags?: string[];
  coverImageURL: string;
  pdfURL: string;
  views: number;
  downloads: number;
  year: string;
}

interface PDFDetailPageProps {
  pdf: PDFData | null;
  recommendedPDFs: PDFData[];
}

const JOURNAL_PRICE = 200;

const PDFDetailPage: React.FC<PDFDetailPageProps> = ({
  pdf,
  recommendedPDFs,
}) => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading: subLoading } = useSubscription();
  const {
    hasAccess,
    accessReason,
    loading: accessLoading,
  } = usePDFAccess(pdf?.id || "");
  const { addToCart, isInCart } = useCart();

  if (!pdf) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-12">
            <Newspaper className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-black text-gray-900 mb-4">
              PDF introuvable
            </h1>
            <p className="text-gray-600 mb-6">
              Le journal que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <button
              onClick={() => router.push("/lintelligentpdf")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Retour à la boutique
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const loading = authLoading || subLoading || accessLoading;
  const inCart = isInCart(pdf.id);

  const handleAddToCart = () => {
    addToCart({
      id: pdf.id,
      title: pdf.title,
      issueNumber: pdf.issueNumber,
      coverImageURL: pdf.coverImageURL,
      pdfURL: pdf.pdfURL,
      price: JOURNAL_PRICE,
      publicationDate: pdf.publicationDate,
      year: pdf.year,
    });
  };

  const handleReadNow = () => {
    if (hasAccess) {
      router.push(`/lintelligentpdf/read/${pdf.id}`);
    } else if (!user) {
      router.push(`/signin?redirect=/lintelligentpdf/${pdf.id}`);
    } else {
      // Pas d'accès, afficher options d'achat
      router.push("/abonnement");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
        {/* Hero Section avec détails du PDF */}
        <div className="bg-gradient-to-r from-blue-600 via-red-600 to-blue-700 text-white">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <button
              onClick={() => router.push("/lintelligentpdf")}
              className="mb-6 flex items-center gap-2 text-blue-100 hover:text-white transition-colors"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
              Retour à la boutique
            </button>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Couverture */}
              <div className="relative">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                  <Image
                    src={pdf.coverImageURL}
                    alt={pdf.title}
                    fill
                    className="object-cover"
                  />
                  {!hasAccess && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center p-6">
                      <div className="text-center">
                        <Lock className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-white font-semibold">
                          Aperçu uniquement
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {hasAccess && (
                    <div className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                      <Unlock className="w-4 h-4" />
                      <span className="font-semibold">Accès illimité</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <Newspaper className="w-8 h-8" />
                  <span className="text-blue-200 font-semibold">
                    L'Intelligent d'Abidjan
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-black mb-4">
                  {pdf.title}
                </h1>

                <p className="text-xl text-blue-100 mb-6">
                  {pdf.description ||
                    "Édition numérique du quotidien L'Intelligent d'Abidjan"}
                </p>

                {/* Métadonnées */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-2">
                    <Book className="w-5 h-5 text-blue-200" />
                    <span className="text-blue-100">N° {pdf.issueNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-200" />
                    <span className="text-blue-100">
                      {new Date(pdf.publicationDate).toLocaleDateString(
                        "fr-FR"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-200" />
                    <span className="text-blue-100">{pdf.views} vues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-blue-200" />
                    <span className="text-blue-100">
                      {pdf.downloads} téléchargements
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {pdf.tags && pdf.tags.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-5 h-5" />
                      <span className="font-semibold">Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {pdf.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-6">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                    </div>
                  ) : hasAccess ? (
                    <button
                      onClick={handleReadNow}
                      className="w-full bg-white text-blue-600 px-8 py-4 rounded-xl font-black text-lg hover:bg-blue-50 transition-all hover:scale-105 shadow-xl flex items-center justify-center gap-3"
                    >
                      <Book className="w-6 h-6" />
                      Lire maintenant
                    </button>
                  ) : (
                    <>
                      {user && subscription ? (
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                          <p className="text-white mb-4">
                            ✅ Vous êtes abonné ! Accès à tous les PDFs inclus.
                          </p>
                          <button
                            onClick={handleReadNow}
                            className="w-full bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
                          >
                            Lire maintenant
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-2xl font-black">
                                200 F CFA
                              </span>
                              <span className="text-blue-100">
                                Achat unique
                              </span>
                            </div>
                            {inCart ? (
                              <button
                                onClick={() => router.push("/checkout")}
                                className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                              >
                                <Check className="w-5 h-5" />
                                Dans le panier - Finaliser
                              </button>
                            ) : (
                              <button
                                onClick={handleAddToCart}
                                className="w-full bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                              >
                                <ShoppingCart className="w-5 h-5" />
                                Ajouter au panier
                              </button>
                            )}
                          </div>

                          <div className="text-center">
                            <p className="text-blue-100 mb-2">ou</p>
                            <button
                              onClick={() => router.push("/abonnement")}
                              className="text-white font-semibold underline hover:text-blue-100 transition-colors flex items-center justify-center gap-2 mx-auto"
                            >
                              <CreditCard className="w-5 h-5" />
                              S'abonner pour un accès illimité
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {!user && !loading && (
                    <button
                      onClick={() =>
                        router.push(
                          `/signin?redirect=/lintelligentpdf/${pdf.id}`
                        )
                      }
                      className="w-full bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-bold hover:bg-white/30 transition-colors border border-white/30"
                    >
                      Se connecter pour accéder
                    </button>
                  )}
                </div>

                {/* Raison d'accès */}
                {hasAccess && accessReason && (
                  <div className="mt-4 text-center text-blue-100 text-sm">
                    {accessReason === "subscription"
                      ? "✨ Accès via votre abonnement"
                      : "✅ Vous avez acheté ce journal"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section PDFs recommandés */}
        {recommendedPDFs.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 py-16">
            <h2 className="text-3xl font-black text-gray-900 mb-8">
              Vous pourriez lire aussi
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedPDFs.map((recommendedPDF) => (
                <button
                  key={recommendedPDF.id}
                  onClick={() =>
                    router.push(`/lintelligentpdf/${recommendedPDF.id}`)
                  }
                  className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden"
                >
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={recommendedPDF.coverImageURL}
                      alt={recommendedPDF.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                      {recommendedPDF.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      N° {recommendedPDF.issueNumber}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-blue-600 font-bold">200 F CFA</span>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PDFDetailPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  try {
    // Déterminer l'année (essayer les 3 dernières années)
    const currentYear = new Date().getFullYear();
    const years = [
      currentYear.toString(),
      (currentYear - 1).toString(),
      (currentYear - 2).toString(),
    ];

    let pdfData: PDFData | null = null;
    let foundYear = "";

    // Chercher le PDF dans les différentes années
    for (const year of years) {
      try {
        const docRef = doc(db, "archives", "pdf", year, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          pdfData = {
            id: docSnap.id,
            title: data.title || "Sans titre",
            issueNumber: data.issueNumber || "N/A",
            publicationDate:
              data.publicationDate?.toDate?.()?.toISOString() ||
              data.uploadedAt?.toDate?.()?.toISOString() ||
              new Date().toISOString(),
            description: data.description || undefined,
            tags: data.tags || undefined,
            coverImageURL: data.coverImageURL,
            pdfURL: data.downloadURL,
            views: data.views || 0,
            downloads: data.downloads || 0,
            year,
          };
          foundYear = year;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!pdfData) {
      return {
        props: {
          pdf: null,
          recommendedPDFs: [],
        },
      };
    }

    // Récupérer les PDFs recommandés
    let recommendedPDFs: PDFData[] = [];

    // Si le PDF a des tags, chercher des PDFs similaires
    if (pdfData.tags && pdfData.tags.length > 0) {
      try {
        const journalsRef = collection(db, "archives", "pdf", foundYear);
        const snapshot = await getDocs(journalsRef);

        const similarPDFs = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            if (
              !data.coverImageURL ||
              !data.downloadURL ||
              doc.id === id ||
              !pdfData?.tags
            )
              return null;

            const commonTags = (data.tags || []).filter((tag: string) =>
              pdfData?.tags?.includes(tag)
            );

            if (commonTags.length === 0) return null;

            return {
              id: doc.id,
              title: data.title || "Sans titre",
              issueNumber: data.issueNumber || "N/A",
              publicationDate:
                data.publicationDate?.toDate?.()?.toISOString() ||
                data.uploadedAt?.toDate?.()?.toISOString() ||
                new Date().toISOString(),
              coverImageURL: data.coverImageURL,
              pdfURL: data.downloadURL,
              views: data.views || 0,
              downloads: data.downloads || 0,
              year: foundYear,
              commonTagsCount: commonTags.length,
            };
          })
          .filter(
            (pdf): pdf is PDFData & { commonTagsCount: number } => pdf !== null
          )
          .sort((a, b) => b.commonTagsCount - a.commonTagsCount)
          .slice(0, 4);

        recommendedPDFs = similarPDFs;
      } catch (error) {
        console.error("Erreur récupération PDFs similaires:", error);
      }
    }

    // Si pas assez de PDFs similaires, récupérer les 4 derniers
    if (recommendedPDFs.length < 4) {
      try {
        const journalsRef = collection(db, "archives", "pdf", foundYear);
        const q = query(journalsRef, orderBy("uploadedAt", "desc"), limit(5));
        const snapshot = await getDocs(q);

        const latestPDFs = snapshot.docs
          .map((doc) => {
            if (doc.id === id) return null;

            const data = doc.data();
            if (!data.coverImageURL || !data.downloadURL) return null;

            return {
              id: doc.id,
              title: data.title || "Sans titre",
              issueNumber: data.issueNumber || "N/A",
              publicationDate:
                data.publicationDate?.toDate?.()?.toISOString() ||
                data.uploadedAt?.toDate?.()?.toISOString() ||
                new Date().toISOString(),
              coverImageURL: data.coverImageURL,
              pdfURL: data.downloadURL,
              views: data.views || 0,
              downloads: data.downloads || 0,
              year: foundYear,
            };
          })
          .filter((pdf): pdf is PDFData => pdf !== null)
          .slice(0, 4);

        recommendedPDFs = latestPDFs;
      } catch (error) {
        console.error("Erreur récupération derniers PDFs:", error);
      }
    }

    return {
      props: {
        pdf: pdfData,
        recommendedPDFs,
      },
    };
  } catch (error) {
    console.error("❌ Erreur récupération PDF:", error);
    return {
      props: {
        pdf: null,
        recommendedPDFs: [],
      },
    };
  }
};
