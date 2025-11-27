import React, { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth, usePDFAccess } from "../../../hooks/useAuth";
import { useRouter } from "next/router";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Printer,
  RotateCw,
  Maximize,
  Minimize,
  Lock,
  Home,
  Book,
} from "lucide-react";

interface PDFReaderPageProps {
  pdf: {
    id: string;
    title: string;
    issueNumber: string;
    pdfURL: string;
    coverImageURL: string;
    year: string;
  } | null;
}

const PDFReaderPage: React.FC<PDFReaderPageProps> = ({ pdf }) => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { hasAccess, loading: accessLoading } = usePDFAccess(pdf?.id || "");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloadInProgress, setDownloadInProgress] = useState(false);

  // Vérifier l'accès
  useEffect(() => {
    if (!authLoading && !accessLoading) {
      if (!user) {
        router.push(`/signin?redirect=/lintelligentpdf/read/${pdf?.id}`);
      } else if (!hasAccess) {
        router.push(`/lintelligentpdf/${pdf?.id}`);
      }
    }
  }, [user, hasAccess, authLoading, accessLoading, router, pdf]);

  // Incrémenter les téléchargements lors du premier chargement
  useEffect(() => {
    if (pdf && hasAccess) {
      const incrementViews = async () => {
        try {
          const docRef = doc(db, "archives", "pdf", pdf.year, pdf.id);
          await updateDoc(docRef, {
            views: increment(1),
          });
        } catch (error) {
          console.error("Erreur incrémentation vues:", error);
        }
      };
      incrementViews();
    }
  }, [pdf, hasAccess]);

  if (!pdf) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-24 h-24 text-gray-600 mx-auto mb-6" />
          <h1 className="text-3xl font-black mb-4">PDF introuvable</h1>
          <button
            onClick={() => router.push("/lintelligentpdf")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold"
          >
            Retour à la boutique
          </button>
        </div>
      </div>
    );
  }

  if (authLoading || accessLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Vérification des accès...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <Lock className="w-24 h-24 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black mb-4">Accès refusé</h1>
          <p className="text-gray-400 mb-6">
            Vous devez être abonné ou avoir acheté ce journal pour le lire.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/lintelligentpdf/${pdf.id}`)}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold"
            >
              Voir les détails
            </button>
            <button
              onClick={() => router.push("/lintelligentpdf")}
              className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-semibold"
            >
              Retour à la boutique
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleDownload = async () => {
    if (downloadInProgress) return;

    setDownloadInProgress(true);
    try {
      const response = await fetch(pdf.pdfURL);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${pdf.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Incrémenter les téléchargements
      const docRef = doc(db, "archives", "pdf", pdf.year, pdf.id);
      await updateDoc(docRef, {
        downloads: increment(1),
      });
    } catch (error) {
      console.error("Erreur téléchargement:", error);
      alert("Erreur lors du téléchargement. Veuillez réessayer.");
    } finally {
      setDownloadInProgress(false);
    }
  };

  const handlePrint = () => {
    window.open(pdf.pdfURL, "_blank");
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Barre d'outils supérieure */}
      <div className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Informations du document */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/lintelligentpdf")}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Retour"
              >
                <Home className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold line-clamp-1">{pdf.title}</h1>
                <p className="text-sm text-gray-400">N° {pdf.issueNumber}</p>
              </div>
            </div>

            {/* Contrôles */}
            <div className="flex items-center gap-2">
              {/* Zoom */}
              <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setZoom((z) => Math.max(50, z - 10))}
                  className="p-2 hover:bg-gray-600 rounded transition-colors"
                  title="Zoom arrière"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="px-3 text-sm font-semibold min-w-[60px] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(200, z + 10))}
                  className="p-2 hover:bg-gray-600 rounded transition-colors"
                  title="Zoom avant"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </div>

              {/* Rotation */}
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Rotation"
              >
                <RotateCw className="w-5 h-5" />
              </button>

              {/* Télécharger */}
              <button
                onClick={handleDownload}
                disabled={downloadInProgress}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                title="Télécharger"
              >
                <Download
                  className={`w-5 h-5 ${downloadInProgress ? "animate-bounce" : ""}`}
                />
              </button>

              {/* Imprimer */}
              <button
                onClick={handlePrint}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Imprimer"
              >
                <Printer className="w-5 h-5" />
              </button>

              {/* Plein écran */}
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title={isFullscreen ? "Quitter plein écran" : "Plein écran"}
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visionneuse PDF */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="relative w-full max-w-5xl">
          <iframe
            src={`${pdf.pdfURL}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full rounded-lg shadow-2xl border-2 border-gray-700"
            style={{
              height: "calc(100vh - 120px)",
              transform: `rotate(${rotation}deg) scale(${zoom / 100})`,
              transition: "transform 0.3s ease",
            }}
            title={pdf.title}
          />
        </div>
      </div>

      {/* Navigation page (si iframe ne gère pas) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 rounded-full shadow-2xl border border-gray-700 px-6 py-3 flex items-center gap-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage <= 1}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold">
          Page {currentPage} {totalPages > 0 && `/ ${totalPages}`}
        </span>
        <button
          onClick={() =>
            setCurrentPage((p) =>
              totalPages > 0 ? Math.min(totalPages, p + 1) : p + 1
            )
          }
          disabled={totalPages > 0 && currentPage >= totalPages}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PDFReaderPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  try {
    const currentYear = new Date().getFullYear();
    const years = [
      currentYear.toString(),
      (currentYear - 1).toString(),
      (currentYear - 2).toString(),
    ];

    for (const year of years) {
      try {
        const docRef = doc(db, "archives", "pdf", year, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          return {
            props: {
              pdf: {
                id: docSnap.id,
                title: data.title || "Sans titre",
                issueNumber: data.issueNumber || "N/A",
                pdfURL: data.downloadURL,
                coverImageURL: data.coverImageURL,
                year,
              },
            },
          };
        }
      } catch (error) {
        continue;
      }
    }

    return {
      props: {
        pdf: null,
      },
    };
  } catch (error) {
    console.error("❌ Erreur récupération PDF:", error);
    return {
      props: {
        pdf: null,
      },
    };
  }
};
