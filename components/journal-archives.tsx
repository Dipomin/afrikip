"use client";

import { useEffect, useState } from "react";

import { Button } from "../@/components/ui/button";
import { FaFilePdf } from "react-icons/fa";
import { Loader } from "lucide-react";
import PdfViewer from "./pdfViewer";
import "../styles/journalArchive.module.css";
import { db, storage } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";

interface Journauxpdf {
  id: string;
  title: string | null;
  coverImage: string | null;
  created_at: string;
  annee: string | null;
  pdfPath: string | null;
  downloadURL?: string | null;
  filename?: string | null;
  updatedAt: string | null;
}

const JournalArchive: React.FC = () => {
  const [journauxpdf, setJournauxpdf] = useState<Journauxpdf[]>([]);
  const [filteredPdfs, setFilteredPdfs] = useState<Journauxpdf[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const [isClient, setIsClient] = useState(false);

  console.log("Liste des journaux récupérés", journauxpdf);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        setLoading(true);
        setError(null);

        // Parcourir toutes les années disponibles
        const allJournals: Journauxpdf[] = [];
        const years = [
          "2009",
          "2010",
          "2011",
          "2012",
          "2013",
          "2014",
          "2015",
          "2016",
          "2017",
          "2018",
          "2019",
          "2020",
          "2021",
          "2022",
          "2023",
          "2024",
        ];

        for (const year of years) {
          try {
            // Structure réelle: archives/pdf/{year} (3 segments - valide)
            const yearRef = collection(db, "archives", "pdf", year);
            const q = query(yearRef, orderBy("uploadedAt", "desc"));
            const querySnapshot = await getDocs(q);

            console.log(`Journaux trouvés pour ${year}:`, querySnapshot.size);

            // Traiter chaque document pour générer l'URL signée
            const yearJournalsPromises = querySnapshot.docs.map(async (doc) => {
              const data = doc.data();

              // Générer l'URL de téléchargement avec token depuis Firebase Storage
              let downloadUrl = data.downloadURL;
              try {
                // Construire le chemin Storage: archives/pdf/{year}/{docId}
                const storagePath = `archives/pdf/${year}/${doc.id}`;
                const storageRef = ref(storage, storagePath);
                downloadUrl = await getDownloadURL(storageRef);
                console.log(`URL générée pour ${year}/${doc.id}:`, downloadUrl);
              } catch (urlError) {
                console.warn(
                  `Impossible de générer l'URL pour ${doc.id}:`,
                  urlError
                );
                // Fallback sur l'URL stockée si disponible
                downloadUrl = data.downloadURL || null;
              }

              return {
                id: doc.id,
                title: data.title || data.filename || doc.id,
                coverImage: data.coverImageURL || data.coverImage || null,
                created_at:
                  data.uploadedAt?.toDate?.()?.toISOString() ||
                  data.publicationDate?.toDate?.()?.toISOString() ||
                  data.created_at ||
                  new Date().toISOString(),
                annee: JSON.stringify([year]),
                pdfPath: downloadUrl,
                downloadURL: downloadUrl,
                filename: data.filename || null,
                updatedAt: data.updatedAt || null,
              };
            });

            const yearJournals = await Promise.all(yearJournalsPromises);
            allJournals.push(...yearJournals);
          } catch (yearError: any) {
            console.warn(`Année ${year} non disponible:`, yearError);

            // Si c'est une erreur de permission, on la remonte
            if (yearError?.code === "permission-denied") {
              throw new Error(
                "Permissions Firebase insuffisantes. Veuillez déployer les règles de sécurité (voir FIREBASE_RULES_DEPLOYMENT.md)"
              );
            }
          }
        }

        console.log(
          "Total journaux récupérés depuis Firebase:",
          allJournals.length
        );
        setJournauxpdf(allJournals);
        setFilteredPdfs(allJournals);
      } catch (err: any) {
        console.error("Error fetching archives:", err);

        let errorMessage = "Impossible de charger les journaux.";

        if (
          err?.code === "permission-denied" ||
          err?.message?.includes("permission")
        ) {
          errorMessage =
            "🔐 Permissions Firebase insuffisantes. Les règles de sécurité doivent être déployées. Consultez le fichier FIREBASE_RULES_DEPLOYMENT.md pour les instructions.";
        } else if (err?.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchJournals();
  }, []);

  useEffect(() => {
    console.log("Selected Year:", selectedYear);
    if (selectedYear) {
      const filtered = journauxpdf.filter((journal) => {
        const parsedYear = JSON.parse(journal.annee || "[]")[0];
        console.log(`Filtering: ${parsedYear} === ${selectedYear}`);
        return parsedYear === selectedYear;
      });
      console.log("Filtered Journals:", filtered);
      setFilteredPdfs(filtered);
      setCurrentPage(1); // Reset to first page when filtering
    } else {
      setFilteredPdfs(journauxpdf);
    }
  }, [selectedYear, journauxpdf]);

  if (!isClient) return null;

  const handleYearClick = (year: string) => {
    setSelectedYear(year);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const viewJournal = (pdfPath: string | null) => {
    if (pdfPath) {
      setSelectedPdf(pdfPath);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPdfs = filteredPdfs.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredPdfs.length / itemsPerPage);

  const years = [
    "2009",
    "2010",
    "2011",
    "2012",
    "2013",
    "2014",
    "2015",
    "2016",
    "2017",
    "2018",
    "2019",
    "2020",
    "2021",
    "2022",
    "2023",
    "2024",
  ];

  return (
    <div className="container mx-auto px-4 pb-12">
      <h2 className="uppercase lg:text-4xl text-2xl font-black text-center p-12">
        Archives des parutions du quotidien l&apos;intelligent d&apos;Abidjan
      </h2>

      {/* Filtres par année */}
      <div className="flex flex-wrap justify-center mb-8 gap-2">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => handleYearClick(year)}
            className={`px-4 py-2 transition-all duration-200 ${
              selectedYear === year
                ? "bg-blue-600 shadow-lg scale-105"
                : "bg-slate-800 hover:bg-slate-700"
            } text-white text-lg rounded-md font-bold`}
          >
            {year}
          </button>
        ))}
        <button
          onClick={() => setSelectedYear(null)}
          className={`px-4 py-2 transition-all duration-200 ${
            selectedYear === null
              ? "bg-blue-600 shadow-lg scale-105"
              : "bg-slate-800 hover:bg-slate-700"
          } text-white text-lg rounded-md font-bold`}
        >
          Toutes les années
        </button>
      </div>

      {/* Statistiques */}
      {!loading && (
        <div className="text-center mb-6 text-gray-600">
          <p className="text-lg">
            {filteredPdfs.length} journal{filteredPdfs.length > 1 ? "aux" : ""}{" "}
            trouvé{filteredPdfs.length > 1 ? "s" : ""}
            {selectedYear && ` pour l'année ${selectedYear}`}
          </p>
        </div>
      )}

      {/* Grille des journaux */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col justify-center items-center p-16 space-y-4">
            <Loader className="animate-spin" color="red" size={48} />
            <div className="text-xl font-semibold text-gray-700">
              Chargement des archives...
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center p-16 space-y-6 bg-red-50 rounded-xl border-2 border-red-200 max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-red-900">
                Erreur de chargement
              </h3>
              <p className="text-red-700 whitespace-pre-wrap max-w-2xl">
                {error}
              </p>
            </div>
            {error.includes("Permissions") && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-xl">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>Action requise :</strong> Un administrateur doit
                  déployer les règles de sécurité Firebase.
                </p>
                <p className="text-xs text-yellow-700">
                  Consultez le fichier{" "}
                  <code className="bg-yellow-100 px-1 py-0.5 rounded">
                    FIREBASE_RULES_DEPLOYMENT.md
                  </code>{" "}
                  à la racine du projet.
                </p>
              </div>
            )}
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3"
            >
              🔄 Réessayer
            </Button>
          </div>
        ) : currentPdfs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {currentPdfs.map((journal) => (
              <div
                key={journal.id}
                className="journalItem group bg-white p-4 border-2 border-gray-200 rounded-lg shadow-md hover:shadow-xl hover:border-blue-500 transition-all duration-300 cursor-pointer"
                onClick={() =>
                  viewJournal(journal.downloadURL || journal.pdfPath)
                }
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-4 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                    <FaFilePdf
                      color="#dc2626"
                      size={56}
                      className="group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <h3 className="text-center text-sm font-semibold text-gray-800 line-clamp-2 min-h-[40px]">
                    {journal.title || journal.filename || "Sans titre"}
                  </h3>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      viewJournal(journal.downloadURL || journal.pdfPath);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    Lire
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center p-16 space-y-4 bg-gray-50 rounded-lg">
            <FaFilePdf color="#9ca3af" size={80} />
            <div className="text-xl font-semibold text-gray-600">
              Aucun journal trouvé
              {selectedYear && ` pour l'année ${selectedYear}`}
            </div>
            {selectedYear && (
              <Button
                onClick={() => setSelectedYear(null)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Voir tous les journaux
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !loading && !error && (
        <div className="flex flex-wrap justify-center mt-8 gap-2">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md font-semibold ${
              currentPage === 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-slate-800 text-white hover:bg-slate-700"
            }`}
          >
            ← Précédent
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((page) => {
              // Afficher les 3 premières pages, les 3 dernières, et les pages autour de la page actuelle
              return (
                page <= 3 ||
                page > totalPages - 3 ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              );
            })
            .map((page, index, array) => {
              // Ajouter des ellipses entre les groupes de pages
              const prevPage = array[index - 1];
              const showEllipsis = prevPage && page - prevPage > 1;

              return (
                <div key={page} className="flex items-center gap-2">
                  {showEllipsis && (
                    <span className="text-gray-500 px-2">...</span>
                  )}
                  <button
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-md font-semibold transition-all ${
                      currentPage === page
                        ? "bg-blue-600 text-white shadow-lg scale-105"
                        : "bg-slate-800 text-white hover:bg-slate-700"
                    }`}
                  >
                    {page}
                  </button>
                </div>
              );
            })}

          <button
            onClick={() =>
              handlePageChange(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md font-semibold ${
              currentPage === totalPages
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-slate-800 text-white hover:bg-slate-700"
            }`}
          >
            Suivant →
          </button>
        </div>
      )}

      {/* Modal de visualisation PDF */}
      {selectedPdf && (
        <div className="pdfViewerContainer fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">
                Visualisation du journal
              </h3>
              <Button
                onClick={() => setSelectedPdf(null)}
                variant="destructive"
                className="font-semibold"
              >
                ✕ Fermer
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <PdfViewer pdfPath={selectedPdf} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalArchive;
