import React from 'react';
import SimilarArticles from './similar-articles';

// Composant de démonstration pour tester SimilarArticles
const SimilarArticlesDemo: React.FC = () => {
  // Données de test
  const mockCurrentPost = {
    slug: "article-actuel",
    title: "Article de test actuel",
    categories: [
      { name: "Politique", slug: "politique" },
      { name: "Économie", slug: "economie" }
    ]
  };

  const mockRelatedPosts = [
    {
      node: {
        slug: "article-politique-1",
        title: "Les nouvelles réformes politiques en Afrique",
        excerpt: "Une analyse approfondie des récentes réformes politiques qui transforment le paysage africain. Ces changements majeurs impactent directement la vie des citoyens...",
        date: "2024-01-15T10:30:00Z",
        author: "Jean Dupont",
        featuredImage: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800",
        categories: [
          { name: "Politique", slug: "politique" }
        ]
      }
    },
    {
      node: {
        slug: "article-economie-1",
        title: "L'économie africaine en pleine croissance",
        excerpt: "Les indicateurs économiques montrent une croissance soutenue dans plusieurs pays africains. Cette tendance positive s'explique par...",
        date: "2024-01-14T15:45:00Z",
        author: "Marie Martin",
        featuredImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
        categories: [
          { name: "Économie", slug: "economie" }
        ]
      }
    },
    {
      node: {
        slug: "article-international-1",
        title: "Relations diplomatiques : l'Afrique sur la scène mondiale",
        excerpt: "L'influence croissante de l'Afrique dans les relations internationales redéfinit les équilibres géopolitiques mondiaux...",
        date: "2024-01-13T09:20:00Z",
        author: "Pierre Durand",
        featuredImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
        categories: [
          { name: "International", slug: "international" }
        ]
      }
    },
    {
      node: {
        slug: "article-culture-1",
        title: "Renaissance culturelle : l'art africain contemporain",
        excerpt: "Une nouvelle génération d'artistes africains révolutionne la scène culturelle internationale avec des œuvres innovantes...",
        date: "2024-01-12T14:10:00Z",
        author: "Fatou Sall",
        featuredImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
        categories: [
          { name: "Culture", slug: "culture" }
        ]
      }
    },
    {
      node: {
        slug: "article-technologie-1",
        title: "Innovation technologique : l'Afrique à l'ère du numérique",
        excerpt: "Les startups africaines révolutionnent le secteur technologique avec des solutions innovantes adaptées aux défis locaux...",
        date: "2024-01-11T11:30:00Z",
        author: "Amadou Ba",
        featuredImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800",
        categories: [
          { name: "Technologie", slug: "technologie" }
        ]
      }
    },
    {
      node: {
        slug: "article-sport-1",
        title: "Sport africain : les champions qui inspirent",
        excerpt: "Les athlètes africains continuent de briller sur la scène internationale, portant haut les couleurs de leurs pays...",
        date: "2024-01-10T16:45:00Z",
        author: "Koffi Asante",
        featuredImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
        categories: [
          { name: "Sport", slug: "sport" }
        ]
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Démonstration du composant Articles Similaires
          </h1>
          <p className="text-lg text-gray-600">
            Voici un aperçu du composant SimilarArticles avec des données de test
          </p>
        </div>

        {/* Simulation d'un article actuel */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Article actuel (simulation)</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {mockCurrentPost.categories.map((cat, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm font-medium"
              >
                {cat.name}
              </span>
            ))}
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{mockCurrentPost.title}</h3>
          <p className="text-gray-600">
            Ceci est un article de démonstration pour tester le composant Articles Similaires.
            Le composant va analyser les catégories et proposer des articles connexes.
          </p>
        </div>

        {/* Composant Articles Similaires */}
        <SimilarArticles
          currentPost={mockCurrentPost}
          relatedPosts={mockRelatedPosts}
        />

        {/* Informations techniques */}
        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Fonctionnalités du composant :
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li>• <strong>Algorithme de similarité</strong> : Analyse les catégories et mots-clés communs</li>
            <li>• <strong>Design responsive</strong> : Adaptation automatique à tous les écrans</li>
            <li>• <strong>Animations fluides</strong> : Effets hover et transitions CSS</li>
            <li>• <strong>Optimisation SEO</strong> : Liens internes et structure sémantique</li>
            <li>• <strong>Performance</strong> : Chargement optimisé des images avec Next.js</li>
            <li>• <strong>Accessibilité</strong> : Support des lecteurs d'écran et navigation clavier</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SimilarArticlesDemo;
