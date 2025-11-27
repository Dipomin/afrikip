import { useEffect, useRef, useState } from "react";
import { Button } from "../@/components/ui/button";
import { storage } from "../firebase";
import { ref, getDownloadURL } from "firebase/storage";
import "../styles/journalArchive.module.css";

interface PdfViewerProps {
  pdfPath: string | null;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfPath }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfDocRef = useRef<any>(null); // Stocke le document PDF

  useEffect(() => {
    const preventCopyPaste = (e: any) => {
      e.preventDefault();
    };

    document.documentElement.addEventListener("cut", preventCopyPaste);
    document.documentElement.addEventListener("copy", preventCopyPaste);
    document.documentElement.addEventListener("paste", preventCopyPaste);
    document.documentElement.addEventListener("contextmenu", preventCopyPaste);
    return () => {
      document.documentElement.removeEventListener("cut", preventCopyPaste);
      document.documentElement.removeEventListener("copy", preventCopyPaste);
      document.documentElement.removeEventListener("paste", preventCopyPaste);
      document.documentElement.removeEventListener(
        "contextmenu",
        preventCopyPaste
      );
    };
  }, []);

  // Charger le PDF une seule fois
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!pdfPath) {
          setError("Aucun PDF spécifié.");
          setLoading(false);
          return;
        }

        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

        // Toujours utiliser Firebase SDK pour éviter CORS
        let pdfData: ArrayBuffer;
        let finalUrl: string = pdfPath;

        try {
          if (pdfPath.includes("firebasestorage.googleapis.com")) {
            // URL Firebase - extraire le path et générer une URL signée
            const urlMatch = pdfPath.match(/\/o\/([^?]+)/);
            if (urlMatch) {
              const encodedPath = urlMatch[1];
              const storagePath = decodeURIComponent(encodedPath);

              console.log("🔗 Génération URL signée Firebase:", storagePath);

              const storageRef = ref(storage, storagePath);
              // Générer une URL avec token qui peut être utilisée avec fetch sans CORS
              finalUrl = await getDownloadURL(storageRef);

              console.log("✅ URL signée générée");
            } else {
              throw new Error("Format d'URL Firebase invalide");
            }
          }

          // Télécharger le PDF via fetch avec l'URL finale (signée si Firebase)
          console.log("📥 Téléchargement du PDF...");
          const response = await fetch(finalUrl);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          pdfData = await response.arrayBuffer();

          console.log(
            "✅ PDF téléchargé:",
            (pdfData.byteLength / 1024 / 1024).toFixed(2),
            "MB"
          );
        } catch (fetchError: any) {
          console.error("Erreur de téléchargement:", fetchError);

          // Message d'erreur plus détaillé selon le code d'erreur
          let errorMessage = "Impossible de télécharger le PDF.";

          if (
            fetchError?.code === "storage/unauthorized" ||
            fetchError?.message?.includes("403") ||
            fetchError?.message?.includes("unauthorized")
          ) {
            errorMessage =
              "🔐 Permissions Firebase Storage insuffisantes.\n\n" +
              "Les règles Storage doivent être déployées :\n" +
              "1. Ouvrez Firebase Console → Storage → Rules\n" +
              "2. Copiez le contenu de storage.rules\n" +
              "3. Publiez les règles\n\n" +
              "Ou exécutez : ./deploy-storage-console.sh";
          } else if (fetchError?.code === "storage/object-not-found") {
            errorMessage =
              "❌ Fichier PDF introuvable dans Firebase Storage.\n\n" +
              "Le fichier a peut-être été supprimé ou déplacé.";
          } else if (fetchError?.message?.includes("Network")) {
            errorMessage =
              "🌐 Erreur de connexion réseau.\n\n" +
              "Vérifiez votre connexion Internet et réessayez.";
          } else {
            errorMessage = `⚠️ ${errorMessage}\n\nDétails : ${fetchError?.message || "Erreur inconnue"}`;
          }

          setError(errorMessage);
          setLoading(false);
          return;
        }

        // Charger le PDF depuis ArrayBuffer
        const loadingTask = pdfjsLib.getDocument({
          data: pdfData,
        });

        const pdf = await loadingTask.promise;
        pdfDocRef.current = pdf; // Stocker la référence au document PDF
        setNumPages(pdf.numPages);
        setCurrentPage(1); // Commencer à la page 1
        setLoading(false);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError(
          "Erreur lors du chargement du PDF. Vérifiez que le fichier est accessible."
        );
        setLoading(false);
      }
    };

    if (pdfPath) {
      loadPdf();
    }

    // Cleanup
    return () => {
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
        pdfDocRef.current = null;
      }
    };
  }, [pdfPath]); // Ne se déclenche que quand pdfPath change

  // Rendre la page courante quand elle change
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDocRef.current || loading) return;

      try {
        const page = await pdfDocRef.current.getPage(currentPage);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;

        if (canvas) {
          const context = canvas.getContext("2d");
          if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
              canvasContext: context,
              viewport,
            };
            await page.render(renderContext).promise;
            console.log(`✅ Page ${currentPage} rendue`);
          }
        }
      } catch (err) {
        console.error("Erreur lors du rendu de la page:", err);
      }
    };

    renderPage();
  }, [currentPage, loading]); // Se déclenche quand currentPage change

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Chargement du PDF...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 max-w-2xl">
          <div className="flex items-start gap-4">
            <div className="text-4xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-900 mb-3">
                Erreur de chargement du PDF
              </h3>
              <pre className="text-sm text-red-800 whitespace-pre-wrap font-sans leading-relaxed">
                {error}
              </pre>
            </div>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          🔄 Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="pdfViewer h-full flex flex-col">
      {/* Barre de navigation en haut - bien visible et fixe */}
      <div className="sticky top-0 z-10 bg-white shadow-md border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            variant={"outline"}
            className="flex items-center gap-2 font-semibold"
          >
            <span className="text-xl">←</span>
            <span className="hidden sm:inline">Page précédente</span>
          </Button>

          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gray-900">
              Page {currentPage}
            </span>
            <span className="text-gray-400">/</span>
            <span className="text-lg text-gray-600">{numPages}</span>
          </div>

          <Button
            onClick={handleNextPage}
            disabled={currentPage === numPages}
            variant={"outline"}
            className="flex items-center gap-2 font-semibold"
          >
            <span className="hidden sm:inline">Page suivante</span>
            <span className="text-xl">→</span>
          </Button>
        </div>
      </div>

      {/* Canvas PDF */}
      <div className="flex-1 overflow-y-auto bg-gray-100 flex items-start justify-center p-4">
        <canvas ref={canvasRef} className="shadow-2xl"></canvas>
      </div>

      {/* Barre de navigation en bas - pour faciliter la navigation */}
      <div className="sticky bottom-0 z-10 bg-white shadow-md border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            variant={"outline"}
            className="flex items-center gap-2 font-semibold"
          >
            <span className="text-xl">←</span>
            <span className="hidden sm:inline">Page précédente</span>
          </Button>

          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gray-900">
              Page {currentPage}
            </span>
            <span className="text-gray-400">/</span>
            <span className="text-lg text-gray-600">{numPages}</span>
          </div>

          <Button
            onClick={handleNextPage}
            disabled={currentPage === numPages}
            variant={"outline"}
            className="flex items-center gap-2 font-semibold"
          >
            <span className="hidden sm:inline">Page suivante</span>
            <span className="text-xl">→</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
