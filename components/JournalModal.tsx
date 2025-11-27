"use client";

import React, { useEffect } from "react";
import {
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import dynamic from "next/dynamic";

// Import PdfViewer dynamiquement pour éviter les erreurs SSR
const PdfViewer = dynamic(() => import("./pdfViewer"), { ssr: false });

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfURL: string;
  title: string;
  issueNumber: string;
  coverImageURL?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export default function JournalModal({
  isOpen,
  onClose,
  pdfURL,
  title,
  issueNumber,
  coverImageURL,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
}: JournalModalProps) {
  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Navigation avec flèches - DÉSACTIVÉE pour ne pas interférer avec la navigation des pages PDF
  // Les utilisateurs peuvent utiliser les boutons ronds sur les côtés pour changer de journal
  /* useEffect(() => {
    const handleArrows = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && hasPrevious && onPrevious) {
        onPrevious();
      }
      if (e.key === "ArrowRight" && hasNext && onNext) {
        onNext();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleArrows);
    }

    return () => {
      document.removeEventListener("keydown", handleArrows);
    };
  }, [isOpen, hasNext, hasPrevious, onNext, onPrevious]); */

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(pdfURL);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}_${issueNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erreur téléchargement:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="relative z-10 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-black">{title}</h2>
              <p className="text-sm text-gray-300">{issueNumber}</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Bouton télécharger */}
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors font-semibold"
                title="Télécharger le PDF"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Télécharger</span>
              </button>

              {/* Bouton fermer */}
              <button
                onClick={onClose}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors font-semibold"
                title="Fermer (Échap)"
              >
                <X className="w-5 h-5" />
                <span className="hidden sm:inline">Fermer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenu PDF */}
        <div className="relative flex-1 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <PdfViewer pdfPath={pdfURL} />
          </div>

          {/* Boutons de navigation */}
          {hasPrevious && (
            <button
              onClick={onPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-4 rounded-full shadow-xl transition-all hover:scale-110"
              title="Journal précédent (←)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {hasNext && (
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-4 rounded-full shadow-xl transition-all hover:scale-110"
              title="Journal suivant (→)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Footer avec aide clavier */}
        <div className="relative z-10 bg-gray-900 text-gray-400 px-6 py-3 text-center text-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-6">
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Échap</kbd>
              Fermer
            </span>
            {(hasPrevious || hasNext) && (
              <>
                <span className="text-gray-600">|</span>
                <span className="flex items-center gap-2">
                  Utilisez les boutons sur les côtés pour naviguer entre les
                  journaux
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
