import React from 'react';
import SimilarArticles from './similar-articles';

// Composant de test pour vérifier l'affichage des images
const SimilarArticlesImageTest: React.FC = () => {
  // Données de test avec différents formats d'images
  const mockCurrentPost = {
    slug: "article-test",
    title: "Article de test pour les images",
    categories: [
      { name: "Technologie", slug: "technologie" }
    ]
  };

  // Test avec différents formats d'images
  const mockRelatedPostsWithImages = [
    // Image avec URL directe (string)
    {
      node: {
        slug: "article-image-string",
        title: "Article avec image URL directe",
        excerpt: "Test avec une URL d'image directe...",
        date: "2024-01-15T10:30:00Z",
        author: "Test Author 1",
        featuredImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop",
        categories: [
          { name: "Technologie", slug: "technologie" }
        ]
      }
    },
    // Image avec format GraphQL (node.sourceUrl)
    {
      node: {
        slug: "article-image-graphql",
        title: "Article avec format GraphQL",
        excerpt: "Test avec format GraphQL WordPress...",
        date: "2024-01-14T15:45:00Z",
        author: "Test Author 2",
        featuredImage: {
          node: {
            sourceUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop",
            altText: "Image de test GraphQL"
          }
        },
        categories: [
          { name: "Design", slug: "design" }
        ]
      }
    },
    // Image avec objet {url, alt}
    {
      node: {
        slug: "article-image-object",
        title: "Article avec objet image",
        excerpt: "Test avec objet image complet...",
        date: "2024-01-13T09:20:00Z",
        author: "Test Author 3",
        featuredImage: {
          url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop",
          alt: "Image de test objet"
        },
        categories: [
          { name: "Science", slug: "science" }
        ]
      }
    },
    // Image avec objet {src, alt}
    {
      node: {
        slug: "article-image-src",
        title: "Article avec propriété src",
        excerpt: "Test avec propriété src...",
        date: "2024-01-12T14:10:00Z",
        author: "Test Author 4",
        featuredImage: {
          src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
          alt: "Image de test src"
        },
        categories: [
          { name: "Art", slug: "art" }
        ]
      }
    },
    // Image invalide (URL cassée)
    {
      node: {
        slug: "article-image-broken",
        title: "Article avec image cassée",
        excerpt: "Test avec URL d'image invalide...",
        date: "2024-01-11T11:30:00Z",
        author: "Test Author 5",
        featuredImage: "https://invalid-url-that-does-not-exist.com/broken-image.jpg",
        categories: [
          { name: "Test", slug: "test" }
        ]
      }
    },
    // Pas d'image (null)
    {
      node: {
        slug: "article-no-image",
        title: "Article sans image",
        excerpt: "Test sans image du tout...",
        date: "2024-01-10T16:45:00Z",
        author: "Test Author 6",
        featuredImage: null,
        categories: [
          { name: "Actualités", slug: "actualites" }
        ]
      }
    },
    // Image avec domaine WordPress
    {
      node: {
        slug: "article-wordpress-image",
        title: "Article avec image WordPress",
        excerpt: "Test avec image du domaine WordPress...",
        date: "2024-01-09T08:15:00Z",
        author: "Test Author 7",
        featuredImage: "https://www.afrikipresse.fr/wp-content/uploads/2024/01/test-image.jpg",
        categories: [
          { name: "WordPress", slug: "wordpress" }
        ]
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Test d'affichage des images - Articles Similaires
          </h1>
          <p className="text-lg text-gray-600">
            Test avec différents formats d'images et gestion d'erreurs
          </p>
        </div>

        {/* Informations sur les formats testés */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Formats d'images testés :
          </h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>• <strong>URL directe</strong> : string avec URL complète</li>
            <li>• <strong>Format GraphQL</strong> : {`{node: {sourceUrl: string, altText: string}}`}</li>
            <li>• <strong>Objet avec url</strong> : {`{url: string, alt: string}`}</li>
            <li>• <strong>Objet avec src</strong> : {`{src: string, alt: string}`}</li>
            <li>• <strong>URL cassée</strong> : Test de la gestion d'erreur</li>
            <li>• <strong>Pas d'image</strong> : null/undefined</li>
            <li>• <strong>Domaine WordPress</strong> : Image du site principal</li>
          </ul>
        </div>

        {/* Composant Articles Similaires */}
        <SimilarArticles
          currentPost={mockCurrentPost}
          relatedPosts={mockRelatedPostsWithImages}
        />

        {/* Résultats attendus */}
        <div className="mt-12 bg-green-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            ✅ Résultats attendus :
          </h3>
          <ul className="space-y-2 text-green-800">
            <li>• Toutes les images valides s'affichent correctement</li>
            <li>• Les images cassées sont remplacées par un placeholder</li>
            <li>• Les articles sans image affichent un message approprié</li>
            <li>• Les textes alternatifs sont correctement définis</li>
            <li>• Le lazy loading fonctionne</li>
            <li>• Les effets hover sont opérationnels</li>
          </ul>
        </div>

        {/* Instructions de debug */}
        <div className="mt-8 bg-yellow-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4">
            🔍 Debug :
          </h3>
          <ul className="space-y-2 text-yellow-800 text-sm">
            <li>• Ouvrir les outils de développement (F12)</li>
            <li>• Vérifier l'onglet Console pour les erreurs d'images</li>
            <li>• Vérifier l'onglet Network pour les requêtes d'images</li>
            <li>• Tester le hover sur les images pour voir les effets</li>
            <li>• Vérifier que les placeholders s'affichent pour les images cassées</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SimilarArticlesImageTest;
