import { useEffect, useRef, useState } from "react";
import { Button } from "../@/components/ui/button";
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
      document.documentElement.addEventListener(
        "contextmenu",
        preventCopyPaste
      );
    };
  }, []);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

        const loadingTask = pdfjsLib.getDocument(pdfPath as string);
        const pdf = await loadingTask.promise;
        setNumPages(pdf.numPages);

        const renderPage = async (pageNumber: number) => {
          const page = await pdf.getPage(pageNumber);
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
            }
          }
        };

        await renderPage(currentPage);
        setLoading(false);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Erreur lors du chargement du PDF.");
        setLoading(false);
      }
    };

    loadPdf();
  }, [pdfPath, currentPage]);

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
      <div className="flex justify-center items-center">
        Chargement du PDF...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="pdfViewer h-screen overflow-y-scroll">
      <div className="flex justify-between mb-4">
        <Button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          variant={"ghost"}
        >
          Page précédente
        </Button>
        <span>
          Page {currentPage} sur {numPages}
        </span>
        <Button
          onClick={handleNextPage}
          disabled={currentPage === numPages}
          variant={"ghost"}
        >
          Page suivante
        </Button>
      </div>
      <canvas ref={canvasRef}></canvas>
      <div className="flex justify-between mb-4">
        <Button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          variant={"ghost"}
        >
          Page précédente
        </Button>
        <span>
          Page {currentPage} sur {numPages}
        </span>
        <Button
          onClick={handleNextPage}
          disabled={currentPage === numPages}
          variant={"ghost"}
        >
          Page suivante
        </Button>
      </div>
    </div>
  );
};

export default PdfViewer;
