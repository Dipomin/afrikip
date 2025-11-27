import React, { useState } from "react";

import Layout from "../components/layout";
import Container from "../components/container";
import HomeNews2 from "../components/home-news2";
import HomeNews2Modern from "../components/HomeNews2Modern";
// import HomeNews2ModernShowcase from "../components/HomeNews2ModernShowcase";
import { Meta } from "../components/meta";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

/**
 * Page de comparaison des designs HomeNews2
 */
export default function DesignComparison({ preview = false }) {
  const [activeTab, setActiveTab] = useState<'comparison' | 'modern' | 'original'>('comparison');

  // Données de test communes
  const sampleCoverImage = {
    node: {
      sourceUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop",
      mediaDetails: {
        width: 800,
        height: 600,
      },
    },
  };

  const sampleData = {
    title: "🚀 L'intelligence artificielle révolutionne le design moderne",
    excerpt: "Découvrez comment l'IA transforme les processus créatifs et redéfinit les standards de l'industrie du design avec des outils innovants et des approches révolutionnaires.",
    slug: "ia-revolutionne-design",
    date: new Date().toISOString(),
    author: { 
      name: "Dr. Sarah Chen", 
      role: "Design Technologist",
      verified: true 
    },
    category: { 
      name: "Innovation", 
      slug: "innovation", 
      icon: "🚀"
    },
    readTime: 8,
    views: 12500,
    engagement: {
      likes: 342,
      shares: 89,
      bookmarks: 156,
      comments: 47
    },
  };

  return (
    <div>
      <Meta
        postTitle="Comparaison des Designs HomeNews2"
        ogImage="https://www.afrikipresse.com/default.png"
        postExcerptDecoded="Comparaison entre les différentes versions du composant HomeNews2"
        postTags="design, comparaison, composants, moderne"
        ogUrl="https://www.afrikipresse.com/design-comparison"
        publishedTime=""
        articleAuthor=""
        articleSection=""
      />
      
      <Layout preview={preview}>
        <Container>
          <div className="py-8">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-4">
                Évolution du Design HomeNews2
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                Découvrez l'évolution du composant HomeNews2 : du design original vers 
                des propositions ultra-modernes inspirées des dernières tendances.
              </p>

              {/* Navigation */}
              <div className="flex justify-center gap-4 mb-8">
                <Button
                  variant={activeTab === 'comparison' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('comparison')}
                  className="px-6"
                >
                  Comparaison
                </Button>
                <Button
                  variant={activeTab === 'modern' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('modern')}
                  className="px-6"
                >
                  Design Moderne
                </Button>
                <Button
                  variant={activeTab === 'original' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('original')}
                  className="px-6"
                >
                  Design Original
                </Button>
              </div>
            </div>

            {/* Contenu selon l'onglet */}
            {activeTab === 'comparison' && (
              <div className="space-y-16">
                {/* Comparaison côte à côte */}
                <section>
                  <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                    Comparaison Directe
                  </h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Version originale améliorée */}
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          Version Améliorée (v2.0)
                        </h3>
                        <div className="flex justify-center gap-2 mb-4">
                          <Badge variant="secondary">Métadonnées</Badge>
                          <Badge variant="secondary">4 Variants</Badge>
                          <Badge variant="secondary">Accessible</Badge>
                        </div>
                      </div>
                      
                      <HomeNews2
                        {...sampleData}
                        coverImage={sampleCoverImage}
                        variant="featured"
                        featured={true}
                        size="default"
                      />
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-2">✅ Avantages</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Design professionnel et moderne</li>
                          <li>• Métadonnées enrichies</li>
                          <li>• 4 variantes de style</li>
                          <li>• Accessibilité WCAG</li>
                          <li>• Animations fluides</li>
                          <li>• Sécurité renforcée</li>
                        </ul>
                      </div>
                    </div>

                    {/* Version ultra-moderne */}
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          Version Ultra-Moderne (v3.0)
                        </h3>
                        <div className="flex justify-center gap-2 mb-4">
                          <Badge className="bg-purple-600">6 Styles</Badge>
                          <Badge className="bg-pink-600">Glassmorphism</Badge>
                          <Badge className="bg-orange-600">Engagement</Badge>
                        </div>
                      </div>
                      
                      <HomeNews2Modern
                        {...sampleData}
                        coverImage={sampleCoverImage}
                        variant="glassmorphism"
                        featured={true}
                        trending={true}
                        size="default"
                        showActions={true}
                        showEngagement={true}
                      />
                      
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-800 mb-2">🚀 Innovations</h4>
                        <ul className="text-sm text-purple-700 space-y-1">
                          <li>• 6 styles ultra-modernes</li>
                          <li>• Glassmorphism & Neumorphism</li>
                          <li>• Métriques d'engagement</li>
                          <li>• Actions rapides</li>
                          <li>• Profils auteurs avancés</li>
                          <li>• Animations sophistiquées</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Tableau comparatif */}
                <section>
                  <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                    Tableau Comparatif
                  </h2>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded-lg shadow-lg border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold text-gray-900">Fonctionnalité</th>
                          <th className="px-6 py-4 text-center font-semibold text-gray-900">Original</th>
                          <th className="px-6 py-4 text-center font-semibold text-gray-900">Amélioré v2.0</th>
                          <th className="px-6 py-4 text-center font-semibold text-gray-900">Moderne v3.0</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 font-medium">Variantes de design</td>
                          <td className="px-6 py-4 text-center">1</td>
                          <td className="px-6 py-4 text-center text-green-600">4</td>
                          <td className="px-6 py-4 text-center text-purple-600 font-semibold">6</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-6 py-4 font-medium">Métadonnées</td>
                          <td className="px-6 py-4 text-center">❌</td>
                          <td className="px-6 py-4 text-center text-green-600">✅</td>
                          <td className="px-6 py-4 text-center text-purple-600">✅ Avancées</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-medium">Animations</td>
                          <td className="px-6 py-4 text-center">Basiques</td>
                          <td className="px-6 py-4 text-center text-green-600">Fluides</td>
                          <td className="px-6 py-4 text-center text-purple-600">Sophistiquées</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-6 py-4 font-medium">Engagement</td>
                          <td className="px-6 py-4 text-center">❌</td>
                          <td className="px-6 py-4 text-center">❌</td>
                          <td className="px-6 py-4 text-center text-purple-600">✅ Complet</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-medium">Actions rapides</td>
                          <td className="px-6 py-4 text-center">❌</td>
                          <td className="px-6 py-4 text-center">❌</td>
                          <td className="px-6 py-4 text-center text-purple-600">✅</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-6 py-4 font-medium">Glassmorphism</td>
                          <td className="px-6 py-4 text-center">❌</td>
                          <td className="px-6 py-4 text-center">❌</td>
                          <td className="px-6 py-4 text-center text-purple-600">✅</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-medium">Profils auteurs</td>
                          <td className="px-6 py-4 text-center">❌</td>
                          <td className="px-6 py-4 text-center text-green-600">Basique</td>
                          <td className="px-6 py-4 text-center text-purple-600">Avancé</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Galerie de styles modernes */}
                <section>
                  <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                    Galerie des Styles Modernes
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Glassmorphism */}
                    <div className="bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 p-6 rounded-2xl">
                      <HomeNews2Modern
                        title="Style Glassmorphism"
                        excerpt="Effet de verre moderne avec transparence"
                        slug="glassmorphism"
                        coverImage={sampleCoverImage}
                        variant="glassmorphism"
                        size="compact"
                        featured={true}
                      />
                    </div>

                    {/* Neumorphism */}
                    <div className="bg-gray-100 p-6 rounded-2xl">
                      <HomeNews2Modern
                        title="Style Neumorphism"
                        excerpt="Design soft avec ombres subtiles"
                        slug="neumorphism"
                        coverImage={sampleCoverImage}
                        variant="neumorphism"
                        size="compact"
                        trending={true}
                      />
                    </div>

                    {/* Brutalist */}
                    <div className="bg-gray-200 p-6 rounded-2xl">
                      <HomeNews2Modern
                        title="Style Brutalist"
                        excerpt="Design audacieux et contrasté"
                        slug="brutalist"
                        coverImage={sampleCoverImage}
                        variant="brutalist"
                        size="compact"
                        premium={true}
                      />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'modern' && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Component under development</p>
              </div>
            )}

            {activeTab === 'original' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-center text-gray-900">
                  Design Original Amélioré (v2.0)
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <HomeNews2
                    {...sampleData}
                    coverImage={sampleCoverImage}
                    variant="default"
                    size="default"
                  />
                  <HomeNews2
                    {...sampleData}
                    coverImage={sampleCoverImage}
                    variant="featured"
                    featured={true}
                    size="default"
                  />
                  <HomeNews2
                    {...sampleData}
                    coverImage={sampleCoverImage}
                    variant="elevated"
                    size="default"
                  />
                </div>
              </div>
            )}

            {/* Recommandations */}
            <section className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
                💡 Recommandations d'Usage
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-green-800 mb-3">✅ Version Améliorée (v2.0)</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Parfaite pour la production avec un équilibre entre modernité et stabilité.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Sites d'actualités professionnels</li>
                    <li>• Blogs corporatifs</li>
                    <li>• Portails d'information</li>
                    <li>• Applications métier</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-purple-800 mb-3">🚀 Version Ultra-Moderne (v3.0)</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Idéale pour les projets innovants qui veulent se démarquer.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Startups tech</li>
                    <li>• Magazines de design</li>
                    <li>• Plateformes créatives</li>
                    <li>• Sites avant-gardistes</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </Container>
      </Layout>
    </div>
  );
}
