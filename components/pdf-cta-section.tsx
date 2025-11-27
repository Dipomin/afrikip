"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Newspaper,
  Crown,
  ShoppingCart,
  ArrowRight,
  Calendar,
  Sparkles,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { db, storage } from "../firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";

interface Journal {
  id: string;
  title: string | null;
  coverImageURL: string | null;
  created_at: string;
  annee: string | null;
  pdfPath: string | null;
  downloadURL?: string | null;
  filename?: string | null;
  uploadedAt: any;
}

export default function PDFCtaSection() {
  const [latestJournals, setLatestJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestJournals = async () => {
      try {
        setLoading(true);
        const currentYear = new Date().getFullYear().toString();
        const lastYear = (new Date().getFullYear() - 1).toString();

        const allJournals: Journal[] = [];

        // Récupérer les journaux de l'année en cours
        for (const year of [currentYear, lastYear]) {
          try {
            const yearRef = collection(db, "archives", "pdf", year);
            const q = query(yearRef, orderBy("uploadedAt", "desc"), limit(5));
            const querySnapshot = await getDocs(q);

            const yearJournalsPromises = querySnapshot.docs.map(async (doc) => {
              const data = doc.data();
              let downloadUrl = data.downloadURL;
              let coverImageUrl = data.coverImageURL || data.coverImage || null;

              // Générer l'URL du PDF
              try {
                const storagePath = `archives/pdf/${year}/${doc.id}`;
                const storageRef = ref(storage, storagePath);
                downloadUrl = await getDownloadURL(storageRef);
              } catch (error) {
                console.warn(`URL PDF non disponible pour ${doc.id}`);
              }

              // Générer l'URL de l'image de couverture si elle existe dans Storage
              if (data.coverImagePath) {
                try {
                  const imageRef = ref(storage, data.coverImagePath);
                  coverImageUrl = await getDownloadURL(imageRef);
                } catch (error) {
                  console.warn(`URL image non disponible pour ${doc.id}`);
                }
              }

              return {
                id: doc.id,
                title:
                  data.title ||
                  `Journal du ${new Date(data.uploadedAt?.toDate()).toLocaleDateString("fr-FR")}`,
                coverImageURL: coverImageUrl,
                created_at:
                  data.uploadedAt?.toDate().toISOString() ||
                  new Date().toISOString(),
                annee: year,
                pdfPath: data.pdfPath || null,
                downloadURL: downloadUrl,
                filename: data.filename || null,
                uploadedAt: data.uploadedAt,
              };
            });

            const yearJournals = await Promise.all(yearJournalsPromises);
            allJournals.push(...yearJournals);
          } catch (error) {
            console.warn(`Erreur pour l'année ${year}:`, error);
          }
        }

        // Trier par date et prendre les 3 plus récents
        allJournals.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        const latest = allJournals.slice(0, 3);
        console.log(
          "Journaux chargés:",
          latest.map((j) => ({
            id: j.id,
            title: j.title,
            hasCover: !!j.coverImageURL,
            coverUrl: j.coverImageURL,
          }))
        );
        setLatestJournals(latest);
      } catch (error) {
        console.error("Erreur lors du chargement des journaux:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestJournals();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <section className="relative w-full max-w-[1400px] mx-auto my-8">
      {/* Compact Banner Design */}
      <div className="bg-gradient-to-r from-gray-900 via-red-950 to-gray-900 rounded-xl overflow-hidden border border-red-900/20 shadow-lg">
        <div className="p-4 md:p-6">
          {/* Header compact */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-600/20 p-2 rounded-lg">
                <Newspaper className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">
                  Journaux Numériques
                </h3>
                <p className="text-gray-400 text-xs">
                  Éditions PDF disponibles
                </p>
              </div>
            </div>

            <Link
              href="/lintelligentpdf"
              className="text-red-400 hover:text-red-300 text-sm font-semibold flex items-center gap-1 transition-colors"
            >
              Voir tout
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Journaux en ligne compacte */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {loading ? (
              // Loading Skeleton compact
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-lg p-2 animate-pulse"
                >
                  <div className="bg-white/10 h-20 rounded mb-2" />
                  <div className="bg-white/10 h-3 rounded w-3/4" />
                </div>
              ))
            ) : latestJournals.length > 0 ? (
              <>
                {latestJournals.map((journal, index) => (
                  <Link
                    key={journal.id}
                    href={`/lintelligentpdf/${journal.id}`}
                    className="group relative bg-white/5 hover:bg-white/10 rounded-lg overflow-hidden border border-white/10 hover:border-red-500/30 transition-all duration-300"
                  >
                    {/* Mini image */}
                    <div className="relative h-32 w-full overflow-hidden bg-gray-800">
                      {journal.coverImageURL ? (
                        <Image
                          src={journal.coverImageURL}
                          alt={journal.title || "Journal"}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Newspaper className="w-8 h-8 text-white/20" />
                        </div>
                      )}
                      {index === 0 && (
                        <div className="absolute top-1 left-1">
                          <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                            NOUVEAU
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info compacte */}
                    <div className="p-2">
                      <h4 className="text-white text-sm font-semibold line-clamp-2 mb-1 group-hover:text-red-400 transition-colors">
                        {journal.title}
                      </h4>
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-gray-400">
                          {new Date(journal.created_at).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "short",
                            }
                          )}
                        </span>
                        <span className="text-red-400 font-bold">
                          200 F CFA
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Bouton Abonnement compact */}
                <Link
                  href="/abonnement"
                  className="group relative bg-gradient-to-br from-red-600 to-red-700 rounded-lg overflow-hidden border border-red-500/50 hover:border-red-400 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 flex flex-col items-center justify-center p-3 text-center"
                >
                  <Crown className="w-8 h-8 text-yellow-400 mb-2" />
                  <h4 className="text-white text-xs font-bold mb-1">Abonnement Premium</h4>
                  <p className="text-white/80 text-[10px] mb-2">
                    Accès illimité à partir de
                  </p>
                  <div className="text-white text-sm font-bold">
                    2.000 XOF
                    <span className="text-[10px] font-normal">/mois</span>
                  </div>
                </Link>
              </>
            ) : (
              <div className="col-span-4 text-center py-4">
                <p className="text-gray-400 text-sm">
                  Aucun journal disponible
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
