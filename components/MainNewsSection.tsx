import React from "react";
import HeroPost from "./hero-post";
import HomeNews2 from "./home-news2";
import HomeFive from "./home-five";
import ParisSportif from "../pubs/paris-sportif";
import PDFCtaSection from "./pdf-cta-section";

// Types pour les images
interface ImageNode {
  sourceUrl: string;
  mediaDetails?: {
    width: number;
    height: number;
  };
}

interface FeaturedImage {
  node: ImageNode;
}

// Types pour les auteurs
interface Author {
  node?: {
    name?: string;
    firstName?: string;
    lastName?: string;
    avatar?: {
      url?: string;
    };
  };
}

// Interface pour un post
interface PostNode {
  title?: string;
  featuredImage?: FeaturedImage;
  author?: Author;
  date?: string;
  slug?: string;
  excerpt?: string;
  [key: string]: any;
}

interface PostEdge {
  node: PostNode;
}

interface MainNewsSectionProps {
  heroPosts?: PostNode[]; // Maintenant un tableau de 4 posts
  newsTwo?: PostNode;
  newsThree?: PostNode;
  newsFour?: PostNode; // 3ème article
  newsFive: PostEdge[];
}

// Image par défaut
const DEFAULT_IMAGE: FeaturedImage = {
  node: {
    sourceUrl: "https://www.afrikipresse.fr/default.png",
    mediaDetails: {
      width: 1500,
      height: 800,
    },
  },
};

// Fonction utilitaire pour valider un post
const isValidPost = (
  post?: PostNode
): post is PostNode & { title: string; slug: string } => {
  return !!(post && post.title && post.slug);
};

// Fonction utilitaire pour obtenir un auteur valide
const getValidAuthor = (author?: Author): { node: { name: string } } => {
  if (author?.node?.name) {
    return { node: { name: author.node.name } };
  }
  return { node: { name: "Afrikipresse" } };
};

/**
 * Composant pour afficher la section principale des actualités
 * Gère l'affichage du hero post, des actualités secondaires et de la section "cinq actualités"
 *
 * @param heroPosts - 4 articles principaux à mettre en avant (1 grand + 3 petits)
 * @param newsTwo - Deuxième article d'actualité
 * @param newsThree - Troisième article d'actualité
 * @param newsFive - Liste des cinq articles pour la section dédiée
 */
const MainNewsSection: React.FC<MainNewsSectionProps> = ({
  heroPosts = [],
  newsTwo,
  newsThree,
  newsFour,
  newsFive = [],
}) => {
  // Vérification de sécurité pour newsFive
  const validNewsFive = Array.isArray(newsFive) ? newsFive : [];
  const validHeroPosts = Array.isArray(heroPosts) ? heroPosts : [];

  // Log de développement pour déboguer les données manquantes
  if (process.env.NODE_ENV === "development") {
    if (validHeroPosts.length === 0)
      console.warn("MainNewsSection: heroPosts is empty");
    if (!newsTwo) console.warn("MainNewsSection: newsTwo is missing");
    if (!newsThree) console.warn("MainNewsSection: newsThree is missing");
    if (!newsFour) console.warn("MainNewsSection: newsFour is missing");
    if (validNewsFive.length === 0)
      console.warn("MainNewsSection: newsFive is empty");
  }

  // Si aucun contenu valide n'est disponible, afficher un message
  const hasContent =
    validHeroPosts.length > 0 ||
    isValidPost(newsTwo) ||
    isValidPost(newsThree) ||
    isValidPost(newsFour) ||
    validNewsFive.length > 0;

  if (!hasContent) {
    return (
      <div className="py-8 text-center">
        <div className="bg-gray-50 rounded-lg p-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune actualité disponible
          </h3>
          <p className="text-gray-600">
            Les actualités sont en cours de chargement. Veuillez patienter...
          </p>
        </div>
      </div>
    );
  }

  // Préparer les posts pour HeroPost avec validations
  const heroPostsWithDefaults = validHeroPosts
    .filter((post) => isValidPost(post))
    .map((post) => ({
      title: post.title || "",
      coverImage: post.featuredImage || DEFAULT_IMAGE,
      author: getValidAuthor(post.author),
      date: post.date || "",
      slug: post.slug || "",
      excerpt: post.excerpt || "",
    }));

  return (
    <>
      {/* Section Hero - 4 articles en grille 2 colonnes */}
      {heroPostsWithDefaults.length > 0 && (
        <HeroPost posts={heroPostsWithDefaults} />
      )}

      {/* Section CTA Journaux PDF */}
      <PDFCtaSection />

      {/* Section actualités secondaires - 3 articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
        {isValidPost(newsTwo) && (
          <HomeNews2
            title={newsTwo.title}
            coverImage={newsTwo.featuredImage || DEFAULT_IMAGE}
            excerpt={newsTwo.excerpt || ""}
            slug={newsTwo.slug}
          />
        )}
        {isValidPost(newsThree) && (
          <HomeNews2
            title={newsThree.title}
            coverImage={newsThree.featuredImage || DEFAULT_IMAGE}
            excerpt={newsThree.excerpt || ""}
            slug={newsThree.slug}
          />
        )}
        {isValidPost(newsFour) && (
          <HomeNews2
            title={newsFour.title}
            coverImage={newsFour.featuredImage || DEFAULT_IMAGE}
            excerpt={newsFour.excerpt || ""}
            slug={newsFour.slug}
          />
        )}
      </div>

      {/* Publicité */}
      <div className="flex justify-center py-4">
        <ParisSportif />
      </div>

      {/* Section cinq actualités */}
      <div className="grid grid-cols-1 lg:flex py-8">
        {validNewsFive.length > 0 && <HomeFive posts={validNewsFive} />}
      </div>
    </>
  );
};

export default MainNewsSection;
