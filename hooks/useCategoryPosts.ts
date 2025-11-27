import { useMemo } from 'react';

interface PostEdge {
  node: {
    categories: {
      edges: Array<{
        node: {
          slug: string;
        };
      }>;
    };
    [key: string]: any;
  };
}

interface CategoryPostsResult {
  main: PostEdge[];
  listOne: PostEdge[];
  listTwo: PostEdge[];
  mini: PostEdge[];
}

/**
 * Hook personnalisé pour filtrer et organiser les posts par catégorie
 * @param edges - Tous les posts
 * @param categorySlug - Le slug de la catégorie à filtrer
 * @param limit - Limite du nombre de posts à récupérer
 * @returns Objet contenant les posts organisés en sections
 */
export const useCategoryPosts = (
  edges: PostEdge[],
  categorySlug: string,
  limit: number = 16
): CategoryPostsResult => {
  return useMemo(() => {
    // Filtrer les posts par catégorie
    const categoryPosts = edges.filter((edge) =>
      edge.node.categories.edges.some(
        (category) => category.node.slug === categorySlug
      )
    );

    // Limiter le nombre de posts
    const limitedPosts = categoryPosts.slice(0, limit);

    // Organiser en sections
    return {
      main: limitedPosts.slice(0, 1),
      listOne: limitedPosts.slice(1, 4),
      listTwo: limitedPosts.slice(6, 9),
      mini: limitedPosts.slice(9, 15),
    };
  }, [edges, categorySlug, limit]);
};

/**
 * Hook pour organiser les posts d'actualités principales
 * @param edges - Tous les posts
 * @returns Objet contenant les différentes sections d'actualités
 */
export const useMainNewsSections = (edges: PostEdge[]) => {
  return useMemo(() => ({
    heroPosts: edges.slice(0, 4).map(edge => edge.node), // 4 premiers posts pour HeroPost
    newsTwo: edges[4]?.node,
    newsThree: edges[5]?.node,
    newsFour: edges[6]?.node, // 3ème article pour HomeNews2
    newsFive: edges.slice(7, 19), // 12 articles (indices 7 à 18)
    alertNews: edges.slice(0, 10),
  }), [edges]);
};
