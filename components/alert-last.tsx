import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";

interface Post {
  node: {
    title?: string;
    slug?: string;
    date?: string;
    categories?: {
      edges: Array<{
        node: {
          slug: string;
          name?: string;
        };
      }>;
    };
    [key: string]: any;
  };
}

interface AlertLastProps {
  posts: Post[];
}

// Couleurs de catégories variées
const categoryColors: Record<string, string> = {
  politique: "bg-blue-600",
  economie: "bg-green-600",
  sport: "bg-orange-600",
  culture: "bg-purple-600",
  international: "bg-red-600",
  societe: "bg-teal-600",
  technologie: "bg-indigo-600",
  sante: "bg-pink-600",
  opinion: "bg-emerald-600",
  education: "bg-amber-600",
  default: "bg-red-600",
};

/**
 * Composant AlertLast modernisé
 * Affiche 5 alertes à la fois avec animation fade, sur 10 actualités au total
 */
export default function AlertLast({ posts }: AlertLastProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Limiter aux 10 dernières actualités
  const latestPosts = posts.slice(0, 10);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(latestPosts.length / itemsPerPage);

  useEffect(() => {
    if (latestPosts.length <= itemsPerPage) return;

    const fadeInterval = setInterval(() => {
      // Fade out
      setIsVisible(false);

      // Attendre la fin de l'animation fade out avant de changer de page
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % totalPages);
        // Fade in
        setIsVisible(true);
      }, 500); // Durée de l'animation fade out
    }, 8000); // 8 secondes: 7.5s affichage + 0.5s transition

    return () => clearInterval(fadeInterval);
  }, [latestPosts.length, totalPages, itemsPerPage]);

  // Obtenir les 5 actualités actuelles
  const currentPosts = latestPosts.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  // Formater la date et l'heure
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return { date: "", time: "" };
    const date = new Date(dateString);
    const dateFormatted = date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeFormatted = date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { date: dateFormatted, time: timeFormatted };
  };

  // Obtenir la couleur de la catégorie
  const getCategoryColor = (categorySlug: string) => {
    return categoryColors[categorySlug.toLowerCase()] || categoryColors.default;
  };

  if (!latestPosts || latestPosts.length === 0) {
    return null;
  }

  return (
    <section
      className="w-full bg-gradient-to-r from-blue-900 via-red-700 to-blue-900 shadow-2xl overflow-hidden py-6 px-4"
      role="banner"
      aria-label="Dernières actualités"
    >
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 transition-all duration-500 ${
          isVisible
            ? "opacity-100 transform translate-y-0"
            : "opacity-0 transform -translate-y-4"
        }`}
      >
        {currentPosts
          .filter(({ node }) => node.title && node.slug)
          .map(({ node }) => {
            const { date, time } = formatDateTime(node.date);
            const category = node.categories?.edges[0]?.node;
            const categoryName = category?.name || "Actualité";
            const categorySlug = category?.slug || "default";
            const categoryColor = getCategoryColor(categorySlug);

            return (
              <Link
                key={node.slug}
                href={`/article/${node.slug}`}
                className="group relative backdrop-blur-sm p-4 transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Ligne 1: Catégorie + Date + Heure */}
                <div className="flex items-center justify-between gap-2 mb-3 text-xs">
                  <span
                    className={`${categoryColor} text-white px-3 py-1 rounded-full font-semibold uppercase tracking-wider shadow-lg`}
                  >
                    {categoryName}
                  </span>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{date}</span>
                    <span className="text-red-400 font-semibold">{time}</span>
                  </div>
                </div>

                {/* Ligne 2: Titre (max 4 lignes) */}
                <h3 className="text-white text-sm font-semibold leading-snug line-clamp-4 group-hover:text-red-400 transition-colors duration-300">
                  {node.title}
                </h3>

                {/* Effet de brillance au survol */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg pointer-events-none" />
              </Link>
            );
          })}
      </div>

      {/* Indicateurs de pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setIsVisible(true);
                }, 500);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-red-600 w-8"
                  : "bg-gray-600 hover:bg-red-400"
              }`}
              aria-label={`Aller à la page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
