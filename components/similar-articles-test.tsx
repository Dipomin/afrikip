import React from 'react';
import SimilarArticles from './similar-articles';

// Composant de test pour vérifier la correction de l'erreur map
const SimilarArticlesTest: React.FC = () => {
  // Données de test avec différents formats de catégories
  const mockCurrentPost = {
    slug: "article-test",
    title: "Article de test",
    categories: [
      { name: "Politique", slug: "politique" },
      { name: "Économie", slug: "economie" }
    ]
  };

  // Test avec différents formats de données pour les catégories
  const mockRelatedPostsWithVariousFormats = [
    // Format standard (tableau d'objets avec name/slug)
    {
      node: {
        slug: "article-1",
        title: "Article avec catégories standard",
        excerpt: "Extrait de l'article...",
        date: "2024-01-15T10:30:00Z",
        author: "Auteur 1",
        featuredImage: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800",
        categories: [
          { name: "Politique", slug: "politique" }
        ]
      }
    },
    // Format GraphQL avec edges
    {
      node: {
        slug: "article-2",
        title: "Article avec format GraphQL edges",
        excerpt: "Extrait de l'article...",
        date: "2024-01-14T15:45:00Z",
        author: "Auteur 2",
        featuredImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
        categories: {
          edges: [
            { node: { name: "Économie", slug: "economie" } }
          ]
        }
      }
    },
    // Format GraphQL avec nodes
    {
      node: {
        slug: "article-3",
        title: "Article avec format GraphQL nodes",
        excerpt: "Extrait de l'article...",
        date: "2024-01-13T09:20:00Z",
        author: "Auteur 3",
        featuredImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
        categories: {
          nodes: [
            { name: "International", slug: "international" }
          ]
        }
      }
    },
    // Format avec tableau de chaînes
    {
      node: {
        slug: "article-4",
        title: "Article avec catégories en chaînes",
        excerpt: "Extrait de l'article...",
        date: "2024-01-12T14:10:00Z",
        author: "Auteur 4",
        featuredImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
        categories: ["Culture", "Art"]
      }
    },
    // Format avec catégorie unique (chaîne)
    {
      node: {
        slug: "article-5",
        title: "Article avec catégorie unique",
        excerpt: "Extrait de l'article...",
        date: "2024-01-11T11:30:00Z",
        author: "Auteur 5",
        featuredImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800",
        categories: "Sport"
      }
    },
    // Format avec catégories null/undefined
    {
      node: {
        slug: "article-6",
        title: "Article sans catégories",
        excerpt: "Extrait de l'article...",
        date: "2024-01-10T16:45:00Z",
        author: "Auteur 6",
        featuredImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
        categories: null
      }
    },
    // Format avec tableau vide
    {
      node: {
        slug: "article-7",
        title: "Article avec tableau vide",
        excerpt: "Extrait de l'article...",
        date: "2024-01-09T08:15:00Z",
        author: "Auteur 7",
        featuredImage: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800",
        categories: []
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Test de correction - Articles Similaires
          </h1>
          <p className="text-lg text-gray-600">
            Test avec différents formats de données pour les catégories
          </p>
        </div>

        {/* Informations sur les formats testés */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Formats de catégories testés :
          </h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>• <strong>Standard</strong> : Array&lt;{`{name: string, slug: string}`}&gt;</li>
            <li>• <strong>GraphQL edges</strong> : {`{edges: [{node: {name: string}}]}`}</li>
            <li>• <strong>GraphQL nodes</strong> : {`{nodes: [{name: string}]}`}</li>
            <li>• <strong>Tableau de chaînes</strong> : string[]</li>
            <li>• <strong>Chaîne unique</strong> : string</li>
            <li>• <strong>Valeurs nulles</strong> : null/undefined</li>
            <li>• <strong>Tableau vide</strong> : []</li>
          </ul>
        </div>

        {/* Composant Articles Similaires */}
        <SimilarArticles
          currentPost={mockCurrentPost}
          relatedPosts={mockRelatedPostsWithVariousFormats}
        />

        {/* Résultat attendu */}
        <div className="mt-12 bg-green-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            ✅ Résultat attendu :
          </h3>
          <ul className="space-y-2 text-green-800">
            <li>• Aucune erreur "map is not a function"</li>
            <li>• Tous les articles s'affichent correctement</li>
            <li>• Les catégories sont normalisées et affichées</li>
            <li>• L'algorithme de similarité fonctionne</li>
            <li>• Les articles sont triés par pertinence</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SimilarArticlesTest;
