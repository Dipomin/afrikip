import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import he from "he";
import striptags from "striptags";
import DateComponent from "./date";

interface SimilarArticle {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  featuredImage?: {
    url: string;
    alt?: string;
  } | null;
  categories: Array<{
    name: string;
    slug: string;
  }>;
  author?: string;
  readingTime?: number;
}

interface SimilarArticlesProps {
  currentPost: {
    slug: string;
    categories: Array<{
      name: string;
      slug: string;
    }>;
    title: string;
  };
  relatedPosts: Array<{
    node?: {
      slug: string;
      title?: string;
      featuredImage: any;
      date?: string;
      author?: string;
      excerpt?: string;
      categories?: any;
    };
  }>;
  className?: string;
}

const SimilarArticles: React.FC<SimilarArticlesProps> = ({
  currentPost,
  relatedPosts,
  className = "",
}) => {
  const [articles, setArticles] = useState<SimilarArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fonction pour normaliser les catégories selon différents formats
    const normalizeCategories = (categories: any): string[] => {
      if (!categories) return [];

      // Si c'est déjà un tableau de chaînes
      if (Array.isArray(categories) && typeof categories[0] === "string") {
        return categories.map((cat: string) => cat.toLowerCase());
      }

      // Si c'est un tableau d'objets avec propriété 'name'
      if (Array.isArray(categories) && categories[0]?.name) {
        return categories.map((cat: any) => cat.name.toLowerCase());
      }

      // Si c'est un tableau d'objets avec propriété 'node.name' (format GraphQL)
      if (Array.isArray(categories) && categories[0]?.node?.name) {
        return categories.map((cat: any) => cat.node.name.toLowerCase());
      }

      // Si c'est un objet avec propriété 'edges' (format GraphQL)
      if (categories.edges && Array.isArray(categories.edges)) {
        return categories.edges.map((edge: any) =>
          edge.node.name.toLowerCase()
        );
      }

      // Si c'est un objet avec propriété 'nodes' (format GraphQL)
      if (categories.nodes && Array.isArray(categories.nodes)) {
        return categories.nodes.map((node: any) => node.name.toLowerCase());
      }

      // Si c'est une chaîne unique
      if (typeof categories === "string") {
        return [categories.toLowerCase()];
      }

      return [];
    };

    // Fonction pour normaliser les images selon différents formats
    const normalizeImage = (
      featuredImage: any
    ): { url: string; alt: string } | null => {
      if (!featuredImage) return null;

      // Si c'est une chaîne simple (URL directe)
      if (typeof featuredImage === "string") {
        return {
          url: featuredImage,
          alt: "",
        };
      }

      // Si c'est un objet avec node.sourceUrl (format GraphQL WordPress)
      if (featuredImage.node?.sourceUrl) {
        return {
          url: featuredImage.node.sourceUrl,
          alt: featuredImage.node.altText || "",
        };
      }

      // Si c'est un objet avec url directe
      if (featuredImage.url) {
        return {
          url: featuredImage.url,
          alt: featuredImage.alt || "",
        };
      }

      // Si c'est un objet avec src
      if (featuredImage.src) {
        return {
          url: featuredImage.src,
          alt: featuredImage.alt || "",
        };
      }

      return null;
    };

    // Fonction pour calculer la similarité entre articles
    const calculateSimilarity = (current: any, candidate: any): number => {
      let score = 0;

      try {
        // Bonus pour les catégories communes
        const currentCategories = normalizeCategories(current.categories);
        const candidateCategories = normalizeCategories(candidate.categories);

        const commonCategories = currentCategories.filter((cat: string) =>
          candidateCategories.includes(cat)
        );

        score += commonCategories.length * 10;

        // Bonus pour les mots-clés similaires dans le titre
        const currentTitle = current.title || "";
        const candidateTitle = candidate.title || "";

        const currentWords = currentTitle
          .toLowerCase()
          .split(" ")
          .filter((word: string) => word.length > 3);
        const candidateWords = candidateTitle
          .toLowerCase()
          .split(" ")
          .filter((word: string) => word.length > 3);

        const commonWords = currentWords.filter((word: string) =>
          candidateWords.includes(word)
        );

        score += commonWords.length * 5;
      } catch (error) {
        console.warn("Erreur lors du calcul de similarité:", error);
        return 0;
      }

      return score;
    };

    // Fonction pour estimer le temps de lecture
    const estimateReadingTime = (text: string): number => {
      const cleanText = striptags(text);
      const wordCount = cleanText.split(/\s+/).length;
      return Math.max(1, Math.ceil(wordCount / 200));
    };

    // Transformer et filtrer les articles similaires
    const processArticles = () => {
      const processed = relatedPosts
        .filter(({ node }) => node && node.slug !== currentPost.slug)
        .map(({ node }) => {
          if (!node) return null;

          // Calculer un score de similarité basé sur les catégories
          const similarityScore = calculateSimilarity(currentPost, node);

          return {
            slug: node.slug,
            title: node.title || "",
            excerpt: node.excerpt || "",
            date: node.date || "",
            featuredImage: normalizeImage(node.featuredImage),
            categories: normalizeCategories(node.categories).map((name) => ({
              name,
              slug: name.replace(/\s+/g, "-").toLowerCase(),
            })),
            author: node.author || "",
            readingTime: estimateReadingTime(node.excerpt || ""),
            similarityScore,
          };
        })
        .filter(Boolean)
        .sort((a, b) => (b?.similarityScore || 0) - (a?.similarityScore || 0))
        .slice(0, 6) as SimilarArticle[];

      setArticles(processed);
      setIsLoading(false);
    };

    processArticles();
  }, [currentPost, relatedPosts]);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 h-8 w-64 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-64 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <section
      className={`py-16 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de section enrichie */}
        <div className="text-center mb-12 relative">
          {/* Decoration background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <Sparkles className="w-64 h-64 text-purple-500" />
          </div>

          <div className="flex items-center justify-center mb-6 relative">
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-4 rounded-2xl shadow-xl animate-pulse">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 mb-4">
            Articles similaires
          </h2>

          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto font-medium">
            Découvrez d'autres articles qui pourraient vous intéresser sur des
            sujets connexes
          </p>

          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="h-1.5 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            <div className="h-1.5 w-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></div>
            <div className="h-1.5 w-4 bg-red-500 rounded-full"></div>
          </div>
        </div>

        {/* Grille d'articles avec design enrichi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <article
              key={article.slug}
              className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden border-2 border-transparent hover:border-purple-200"
            >
              {/* Effet de brillance animé */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]"></div>

              {/* Badge de tendance pour le premier article */}
              {index === 0 && (
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center shadow-lg animate-pulse">
                    <TrendingUp className="w-4 h-4 mr-1.5" />
                    Tendance
                  </div>
                </div>
              )}

              {/* Badge d'index avec couleurs variées */}
              {index > 0 && (
                <div className="absolute top-4 right-4 z-10">
                  <div
                    className={`
                    ${index === 1 ? "bg-gradient-to-br from-blue-500 to-cyan-500" : ""}
                    ${index === 2 ? "bg-gradient-to-br from-green-500 to-emerald-500" : ""}
                    ${index === 3 ? "bg-gradient-to-br from-yellow-500 to-orange-500" : ""}
                    ${index === 4 ? "bg-gradient-to-br from-purple-500 to-pink-500" : ""}
                    ${index === 5 ? "bg-gradient-to-br from-indigo-500 to-blue-500" : ""}
                    h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg
                  `}
                  >
                    {index + 1}
                  </div>
                </div>
              )}

              {/* Image avec overlay coloré */}
              <div className="relative h-52 overflow-hidden">
                {article.featuredImage?.url ? (
                  <img
                    src={article.featuredImage.url}
                    alt={
                      article.featuredImage.alt ||
                      he.decode(striptags(article.title))
                    }
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125 group-hover:rotate-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "https://via.placeholder.com/400x250/e5e7eb/6b7280?text=Image+non+disponible";
                    }}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-200 via-pink-200 to-red-200 flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-semibold">
                      Image non disponible
                    </span>
                  </div>
                )}
                {/* Overlay avec gradient coloré */}
                <div
                  className={`
                  absolute inset-0 transition-opacity duration-300
                  ${index % 3 === 0 ? "bg-gradient-to-t from-purple-900/60 via-purple-600/20 to-transparent" : ""}
                  ${index % 3 === 1 ? "bg-gradient-to-t from-blue-900/60 via-blue-600/20 to-transparent" : ""}
                  ${index % 3 === 2 ? "bg-gradient-to-t from-pink-900/60 via-pink-600/20 to-transparent" : ""}
                  opacity-60 group-hover:opacity-80
                `}
                ></div>
              </div>

              {/* Contenu enrichi */}
              <div className="p-6 relative">
                {/* Décoration en coin */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-100/50 to-transparent rounded-bl-full pointer-events-none"></div>

                {/* Catégories avec couleurs variées */}
                {article.categories.length > 0 && (
                  <div className="mb-4">
                    <span
                      className={`
                      inline-flex items-center px-4 py-1.5 text-xs font-bold rounded-full shadow-md
                      ${index % 6 === 0 ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : ""}
                      ${index % 6 === 1 ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white" : ""}
                      ${index % 6 === 2 ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" : ""}
                      ${index % 6 === 3 ? "bg-gradient-to-r from-orange-500 to-red-500 text-white" : ""}
                      ${index % 6 === 4 ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white" : ""}
                      ${index % 6 === 5 ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white" : ""}
                    `}
                    >
                      {article.categories[0].name}
                    </span>
                  </div>
                )}

                {/* Titre avec effet hover coloré */}
                <h3
                  className={`
                  text-xl font-black text-gray-900 mb-3 transition-colors duration-300 leading-tight
                  ${index % 3 === 0 ? "group-hover:text-purple-600" : ""}
                  ${index % 3 === 1 ? "group-hover:text-blue-600" : ""}
                  ${index % 3 === 2 ? "group-hover:text-pink-600" : ""}
                `}
                >
                  <Link
                    href={`/article/${article.slug}`}
                    className="hover:underline block line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: article.title }}
                  />
                </h3>

                {/* Extrait */}
                <p className="text-gray-600 text-sm leading-relaxed mb-5 line-clamp-3">
                  {he.decode(striptags(article.excerpt.slice(0, 120)))}...
                </p>

                {/* Métadonnées avec style enrichi */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-1.5 rounded-lg">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-semibold text-gray-700">
                      {article.readingTime} min
                    </span>
                  </div>
                  {article.date && (
                    <DateComponent
                      dateString={article.date}
                      className="text-xs text-gray-500 font-medium"
                    />
                  )}
                </div>

                {/* Lien de lecture avec gradient */}
                <Link
                  href={`/article/${article.slug}`}
                  className={`
                    inline-flex items-center font-bold text-sm transition-all duration-300 group/link px-4 py-2 rounded-xl
                    ${index % 3 === 0 ? "text-purple-600 hover:bg-purple-50" : ""}
                    ${index % 3 === 1 ? "text-blue-600 hover:bg-blue-50" : ""}
                    ${index % 3 === 2 ? "text-pink-600 hover:bg-pink-50" : ""}
                  `}
                >
                  Lire l'article
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/link:translate-x-2" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Bouton voir plus avec design amélioré */}
        <div className="text-center mt-16">
          <div className="relative inline-block">
            {/* Effet de lueur en arrière-plan */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-full blur-xl opacity-50 animate-pulse"></div>

            <Link
              href="/"
              className="relative inline-flex items-center px-10 py-4 text-base font-bold rounded-full shadow-2xl text-white bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
            >
              <Sparkles className="w-5 h-5 mr-2 animate-spin" />
              Découvrir plus d'articles
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>

          {/* Décoration sous le bouton */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div
              className="h-2 w-2 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="h-2 w-2 bg-pink-500 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="h-2 w-2 bg-red-500 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SimilarArticles;
