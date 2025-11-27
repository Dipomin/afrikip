import React, { useState } from "react";
import { GetServerSideProps } from "next";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "../../../firebase";
import Layout from "../../../components/layout";
import JournalCard from "../../../components/JournalCard";
import JournalModal from "../../../components/JournalModal";
import {
  Newspaper,
  Search,
  Filter,
  Calendar,
  Grid,
  List,
  ChevronDown,
} from "lucide-react";

interface JournalData {
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

interface JournalsPageProps {
  journals: JournalData[];
}

const JournalArchive: React.FC<JournalsPageProps> = ({ journals }) => {
  const [selectedJournal, setSelectedJournal] = useState<JournalData | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Extraire les années disponibles
  const availableYears = Array.from(new Set(journals.map((j) => j.year))).sort(
    (a, b) => b.localeCompare(a)
  );

  // Filtrer les journaux
  const filteredJournals = journals.filter((journal) => {
    const matchesSearch =
      journal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journal.issueNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journal.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journal.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesYear = selectedYear === "all" || journal.year === selectedYear;

    return matchesSearch && matchesYear;
  });

  const handleJournalClick = async (journal: JournalData) => {
    setSelectedJournal(journal);

    // Incrémenter les vues
    try {
      const journalRef = doc(db, "archives", "pdf", journal.year, journal.id);
      await updateDoc(journalRef, {
        views: increment(1),
      });
    } catch (error) {
      console.error("Erreur mise à jour vues:", error);
    }
  };

  const handleNextJournal = () => {
    if (!selectedJournal) return;
    const currentIndex = filteredJournals.findIndex(
      (j) => j.id === selectedJournal.id
    );
    if (currentIndex < filteredJournals.length - 1) {
      setSelectedJournal(filteredJournals[currentIndex + 1]);
    }
  };

  const handlePreviousJournal = () => {
    if (!selectedJournal) return;
    const currentIndex = filteredJournals.findIndex(
      (j) => j.id === selectedJournal.id
    );
    if (currentIndex > 0) {
      setSelectedJournal(filteredJournals[currentIndex - 1]);
    }
  };

  const currentIndex = selectedJournal
    ? filteredJournals.findIndex((j) => j.id === selectedJournal.id)
    : -1;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-red-600 to-blue-700 text-white">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="flex items-center gap-4 mb-4">
              <Newspaper className="w-12 h-12" />
              <h1 className="text-4xl md:text-5xl font-black">
                Archives L&apos;Intelligent d&apos;Abidjan
              </h1>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl">
              Consultez les éditions numériques du journal. {journals.length}{" "}
              journaux disponibles en ligne.
            </p>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="sticky top-0 z-40 bg-white shadow-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par titre, numéro, tag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                    showFilters
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Filter className="w-5 h-5" />
                  <span className="hidden sm:inline">Filtres</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "grid"
                        ? "bg-white shadow text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    title="Vue grille"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "list"
                        ? "bg-white shadow text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    title="Vue liste"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Panneau filtres */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-wrap gap-4">
                  {/* Filtre année */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <label className="font-semibold text-gray-700">
                      Année:
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Toutes les années</option>
                      {availableYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stats */}
                  <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-semibold">
                      {filteredJournals.length}
                    </span>
                    journal{filteredJournals.length > 1 ? "aux" : ""} trouvé
                    {filteredJournals.length > 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Grille de journaux */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {filteredJournals.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-12 max-w-2xl mx-auto border-2 border-orange-200">
                <Newspaper className="w-20 h-20 text-orange-500 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-gray-900 mb-4">
                  Aucun journal disponible
                </h3>
                <div className="space-y-3 text-left bg-white rounded-lg p-6 mt-6">
                  <p className="text-gray-700 font-semibold flex items-center gap-2">
                    <span className="text-2xl">💡</span> Raison possible :
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2 ml-8">
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>
                        Les journaux n'ont pas été uploadés correctement
                        (fichiers manquants dans Firebase Storage)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>
                        Les documents Firestore existent mais sans les URLs des
                        fichiers PDF/couvertures
                      </span>
                    </li>
                  </ul>
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-3">
                      🔧 Solution :
                    </p>
                    <a
                      href="/lintelligentpdf/upload"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      <span>📤</span>
                      Uploader un nouveau journal
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {filteredJournals.map((journal) => (
                <JournalCard
                  key={journal.id}
                  id={journal.id}
                  title={journal.title}
                  issueNumber={journal.issueNumber}
                  publicationDate={new Date(journal.publicationDate)}
                  coverImageURL={journal.coverImageURL}
                  pdfURL={journal.pdfURL}
                  year={journal.year}
                  description={journal.description}
                  tags={journal.tags}
                  views={journal.views}
                  downloads={journal.downloads}
                  onClick={() => handleJournalClick(journal)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modal de visualisation */}
        {selectedJournal && (
          <JournalModal
            isOpen={!!selectedJournal}
            onClose={() => setSelectedJournal(null)}
            pdfURL={selectedJournal.pdfURL}
            title={selectedJournal.title}
            issueNumber={selectedJournal.issueNumber}
            coverImageURL={selectedJournal.coverImageURL}
            onNext={handleNextJournal}
            onPrevious={handlePreviousJournal}
            hasNext={currentIndex < filteredJournals.length - 1}
            hasPrevious={currentIndex > 0}
          />
        )}
      </div>
    </Layout>
  );
};

export default JournalArchive;

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Obtenir l'année actuelle et les 2 années précédentes dynamiquement
    const currentYear = new Date().getFullYear();
    const years = [
      currentYear.toString(),
      (currentYear - 1).toString(),
      (currentYear - 2).toString(),
    ];

    let allJournals: JournalData[] = [];

    console.log("🔍 Recherche de journaux dans les années:", years);

    for (const year of years) {
      try {
        const journalsRef = collection(db, "archives", "pdf", year);

        // Essayer d'abord avec uploadedAt (champ le plus fiable)
        const q = query(journalsRef, orderBy("uploadedAt", "desc"), limit(50));

        const snapshot = await getDocs(q);
        console.log(
          `📚 Année ${year}: ${snapshot.docs.length} journaux trouvés`
        );

        const yearJournals: JournalData[] = snapshot.docs
          .map((doc) => {
            const data = doc.data();

            // Vérifier que les champs requis existent
            if (!data.coverImageURL || !data.downloadURL) {
              console.warn(`⚠️ Journal ${doc.id} ignoré: URLs manquantes`);
              return null;
            }

            const journal: JournalData = {
              id: doc.id,
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

            return journal;
          })
          .filter((journal): journal is JournalData => journal !== null);

        allJournals = [...allJournals, ...yearJournals];
      } catch (yearError: any) {
        console.error(`❌ Erreur année ${year}:`, yearError.message);

        // Si l'index uploadedAt n'existe pas, essayer sans tri
        try {
          const journalsRef = collection(db, "archives", "pdf", year);
          const snapshot = await getDocs(journalsRef);
          console.log(
            `📚 Année ${year} (sans tri): ${snapshot.docs.length} journaux`
          );

          const yearJournals = snapshot.docs
            .map((doc) => {
              const data = doc.data();
              if (!data.coverImageURL || !data.downloadURL) return null;

              const journal: JournalData = {
                id: doc.id,
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

              return journal;
            })
            .filter((journal): journal is JournalData => journal !== null);

          allJournals = [...allJournals, ...yearJournals];
        } catch (fallbackError) {
          console.error(`❌ Fallback échoué pour ${year}:`, fallbackError);
        }
      }
    }

    console.log(`✅ Total: ${allJournals.length} journaux récupérés`);

    // Trier par date de publication et prendre les 20 derniers
    allJournals.sort(
      (a, b) =>
        new Date(b.publicationDate).getTime() -
        new Date(a.publicationDate).getTime()
    );

    const latest20 = allJournals.slice(0, 20);
    console.log(`📰 Affichage de ${latest20.length} journaux récents`);

    return {
      props: {
        journals: latest20,
      },
    };
  } catch (error) {
    console.error("❌ Erreur globale:", error);
    return {
      props: {
        journals: [],
      },
    };
  }
};
