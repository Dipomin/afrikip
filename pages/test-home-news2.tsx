import React from "react";

import Layout from "../components/layout";
import Container from "../components/container";
import HomeNews2Showcase from "../components/HomeNews2Showcase";
import HomeNews2 from "../components/home-news2";
import { Meta } from "../components/meta";

/**
 * Page de test pour démontrer les améliorations du composant HomeNews2
 */
export default function TestHomeNews2({ preview = false }) {
  const user = useUser();

  // Données de test
  const sampleCoverImage = {
    node: {
      sourceUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop",
      mediaDetails: {
        width: 800,
        height: 600,
      },
    },
  };

  const testArticles = [
    {
      title: "🚀 L'avenir du développement web avec l'IA",
      excerpt: "Comment l'intelligence artificielle transforme la façon dont nous développons des applications web modernes et interactives.",
      slug: "avenir-dev-web-ia",
      date: new Date().toISOString(),
      author: { name: "Alex Martin", avatar: "/avatar1.jpg" },
      category: { name: "Technologie", slug: "tech" },
      readTime: 7,
      views: 3420,
      featured: true,
    },
    {
      title: "📈 Les cryptomonnaies en 2024 : analyse et perspectives",
      excerpt: "Tour d'horizon des tendances du marché des cryptomonnaies et des innovations blockchain qui façonnent l'économie numérique.",
      slug: "crypto-2024-analyse",
      date: new Date(Date.now() - 3600000).toISOString(),
      author: { name: "Sophie Dubois", avatar: "/avatar2.jpg" },
      category: { name: "Finance", slug: "finance" },
      readTime: 5,
      views: 2180,
      featured: false,
    },
    {
      title: "🌍 Changement climatique : solutions innovantes",
      excerpt: "Découvrez les technologies vertes et les initiatives durables qui contribuent à lutter contre le réchauffement climatique.",
      slug: "solutions-climat-innovantes",
      date: new Date(Date.now() - 7200000).toISOString(),
      author: { name: "Dr. Marie Leroy", avatar: "/avatar3.jpg" },
      category: { name: "Environnement", slug: "environnement" },
      readTime: 6,
      views: 1890,
      featured: false,
    },
  ];

  return (
    <div>
      <Meta
        postTitle="Test HomeNews2 - Composant Moderne"
        ogImage="https://www.afrikipresse.com/default.png"
        postExcerptDecoded="Page de test pour démontrer les améliorations du composant HomeNews2"
        postTags="test, composant, news, design"
        ogUrl="https://www.afrikipresse.com/test-home-news2"
        publishedTime=""
        articleAuthor=""
        articleSection=""
      />
      
      <Layout preview={preview}>
        <Container>
          <div className="py-8">
            {/* En-tête */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Test du Composant HomeNews2 Amélioré
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Découvrez le composant HomeNews2 entièrement refactorisé avec un design moderne,
                des animations fluides, des métadonnées enrichies et une accessibilité complète.
              </p>
            </div>

            {/* Exemples en action */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Exemples en Action
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {testArticles.map((article, index) => (
                  <HomeNews2
                    key={article.slug}
                    {...article}
                    coverImage={sampleCoverImage}
                    variant={index === 0 ? "featured" : index === 1 ? "elevated" : "default"}
                    size="default"
                  />
                ))}
              </div>
            </section>

            {/* Comparaison Avant/Après */}
            <section className="mb-16 bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Comparaison Avant / Après
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Avant (simulé avec style basique) */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">❌ Avant (Style basique)</h3>
                  <div className="bg-white border rounded p-4 shadow-sm">
                    <div className="h-48 bg-gray-200 rounded mb-4"></div>
                    <h4 className="font-bold text-lg mb-2">Titre de l'article</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Extrait de l'article sans métadonnées ni animations...
                    </p>
                    <span className="text-blue-600 text-sm">Lire l'article →</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Design basique</li>
                    <li>• Pas de métadonnées</li>
                    <li>• Animations limitées</li>
                    <li>• Accessibilité basique</li>
                  </ul>
                </div>

                {/* Après */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">✅ Après (Design moderne)</h3>
                  <HomeNews2
                    title="🎨 Design moderne et professionnel"
                    excerpt="Composant entièrement refactorisé avec animations fluides, métadonnées enrichies et accessibilité complète."
                    slug="design-moderne"
                    coverImage={sampleCoverImage}
                    date={new Date().toISOString()}
                    author={{ name: "Équipe Design" }}
                    category={{ name: "Design", slug: "design" }}
                    readTime={3}
                    views={1500}
                    variant="featured"
                    featured={true}
                  />
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• ✨ 4 variantes de design</li>
                    <li>• 📊 Métadonnées enrichies</li>
                    <li>• 🎭 Animations sophistiquées</li>
                    <li>• ♿ Accessibilité WCAG</li>
                    <li>• 🛡️ Sécurité renforcée</li>
                    <li>• 📱 Responsive optimisé</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Showcase complet */}
            <HomeNews2Showcase />

            {/* Informations techniques */}
            <section className="mt-16 bg-blue-50 border border-blue-200 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-blue-900 mb-6">
                Améliorations Techniques
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">🎨 Design System</h3>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Système de variants avec CVA</li>
                    <li>• Tokens de design cohérents</li>
                    <li>• Thème sombre/clair supporté</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">⚡ Performance</h3>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Animations CSS optimisées</li>
                    <li>• Lazy loading des images</li>
                    <li>• Bundle size optimisé</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">🔧 Développeur</h3>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Types TypeScript stricts</li>
                    <li>• Props configurables</li>
                    <li>• Documentation complète</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Note de développement */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Note de développement
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Cette page de test peut être supprimée en production. 
                      Elle sert uniquement à démontrer les nouvelles fonctionnalités 
                      du composant HomeNews2 refactorisé.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Layout>
    </div>
  );
}
