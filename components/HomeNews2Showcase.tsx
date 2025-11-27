import React from "react";
import HomeNews2 from "./home-news2";

/**
 * Composant de démonstration pour HomeNews2
 * Montre toutes les variantes et options disponibles
 */
export default function HomeNews2Showcase() {
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
    title: "L'intelligence artificielle révolutionne le journalisme moderne",
    excerpt: "Découvrez comment les nouvelles technologies transforment la façon dont nous créons, distribuons et consommons l'information dans le monde numérique d'aujourd'hui.",
    slug: "ia-revolutionne-journalisme",
    date: new Date().toISOString(),
    author: { name: "Marie Dubois", avatar: "/avatar.jpg" },
    category: { name: "Technologie", slug: "tech", color: "blue" },
    readTime: 5,
    views: 1250,
  };

  return (
    <div className="p-8 space-y-12 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 text-gray-900">
          HomeNews2 - Composant Moderne
        </h1>
        <p className="text-lg text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          Découvrez toutes les variantes et fonctionnalités du composant HomeNews2 refactorisé
          avec un design moderne, des animations fluides et des métadonnées enrichies.
        </p>

        {/* Variantes */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold text-gray-800">Variantes de Design</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Default */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Default</h3>
              <HomeNews2
                {...sampleData}
                coverImage={sampleCoverImage}
                variant="default"
                size="sm"
              />
            </div>

            {/* Featured */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Featured</h3>
              <HomeNews2
                {...sampleData}
                coverImage={sampleCoverImage}
                variant="featured"
                featured={true}
                size="sm"
              />
            </div>

            {/* Minimal */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Minimal</h3>
              <HomeNews2
                {...sampleData}
                coverImage={sampleCoverImage}
                variant="minimal"
                size="sm"
              />
            </div>

            {/* Elevated */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Elevated</h3>
              <HomeNews2
                {...sampleData}
                coverImage={sampleCoverImage}
                variant="elevated"
                size="sm"
              />
            </div>
          </div>
        </section>

        {/* Tailles */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold text-gray-800">Tailles Disponibles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Small</h3>
              <HomeNews2
                {...sampleData}
                coverImage={sampleCoverImage}
                size="sm"
                variant="default"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Default</h3>
              <HomeNews2
                {...sampleData}
                coverImage={sampleCoverImage}
                size="default"
                variant="default"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Large</h3>
              <HomeNews2
                {...sampleData}
                coverImage={sampleCoverImage}
                size="lg"
                variant="default"
              />
            </div>
          </div>
        </section>

        {/* Métadonnées enrichies */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold text-gray-800">Métadonnées Enrichies</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Avec toutes les métadonnées */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Complet avec métadonnées</h3>
              <HomeNews2
                {...sampleData}
                coverImage={sampleCoverImage}
                variant="featured"
                featured={true}
              />
            </div>

            {/* Minimal sans métadonnées */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Minimal sans métadonnées</h3>
              <HomeNews2
                title={sampleData.title}
                excerpt={sampleData.excerpt}
                slug={sampleData.slug}
                coverImage={sampleCoverImage}
                variant="minimal"
              />
            </div>
          </div>
        </section>

        {/* Exemples d'utilisation */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold text-gray-800">Exemples d'Utilisation</h2>
          
          <div className="space-y-6">
            {/* Article à la une */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-700">Article à la une</h3>
              <div className="max-w-md">
                <HomeNews2
                  title="🔥 Breaking: Découverte scientifique majeure"
                  excerpt="Une équipe de chercheurs fait une découverte qui pourrait changer notre compréhension de l'univers."
                  slug="decouverte-scientifique-majeure"
                  coverImage={sampleCoverImage}
                  date={new Date().toISOString()}
                  author={{ name: "Dr. Sarah Martin" }}
                  category={{ name: "Sciences", slug: "sciences" }}
                  readTime={8}
                  views={5420}
                  featured={true}
                  variant="featured"
                />
              </div>
            </div>

            {/* Article économie */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-700">Article économie</h3>
              <div className="max-w-md">
                <HomeNews2
                  title="📈 Les marchés financiers en hausse constante"
                  excerpt="Analyse des tendances économiques actuelles et perspectives d'avenir pour les investisseurs."
                  slug="marches-financiers-hausse"
                  coverImage={sampleCoverImage}
                  date={new Date(Date.now() - 3600000).toISOString()}
                  author={{ name: "Jean Dupont" }}
                  category={{ name: "Économie", slug: "economie" }}
                  readTime={6}
                  views={2180}
                  variant="elevated"
                />
              </div>
            </div>

            {/* Article sport */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-700">Article sport</h3>
              <div className="max-w-md">
                <HomeNews2
                  title="⚽ Victoire spectaculaire en finale"
                  excerpt="Retour sur un match historique qui restera gravé dans les mémoires des supporters."
                  slug="victoire-spectaculaire-finale"
                  coverImage={sampleCoverImage}
                  date={new Date(Date.now() - 7200000).toISOString()}
                  author={{ name: "Pierre Moreau" }}
                  category={{ name: "Sport", slug: "sport" }}
                  readTime={4}
                  views={8750}
                  variant="default"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Code d'exemple */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold text-gray-800">Exemple de Code</h2>
          
          <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
            <pre className="text-green-400 text-sm">
{`import HomeNews2 from "./components/home-news2";

// Utilisation basique
<HomeNews2
  title="Titre de l'article"
  excerpt="Extrait de l'article..."
  slug="article-slug"
  coverImage={coverImage}
/>

// Utilisation avancée avec métadonnées
<HomeNews2
  title="Article à la une"
  excerpt="Description détaillée..."
  slug="article-une"
  coverImage={coverImage}
  date={new Date().toISOString()}
  author={{ name: "Auteur" }}
  category={{ name: "Catégorie", slug: "cat" }}
  readTime={5}
  views={1250}
  featured={true}
  variant="featured"
  size="lg"
/>`}
            </pre>
          </div>
        </section>

        {/* Fonctionnalités */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold text-gray-800">Fonctionnalités</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">🎨 Design Moderne</h3>
              <p className="text-gray-600 text-sm">
                4 variantes de design avec gradients, ombres et effets visuels avancés
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">📊 Métadonnées Riches</h3>
              <p className="text-gray-600 text-sm">
                Date, auteur, catégorie, temps de lecture et nombre de vues
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">🎭 Animations Fluides</h3>
              <p className="text-gray-600 text-sm">
                Effets hover sophistiqués avec parallax et transitions CSS
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">♿ Accessibilité</h3>
              <p className="text-gray-600 text-sm">
                Conforme WCAG avec navigation clavier et lecteurs d'écran
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">🛡️ Sécurité</h3>
              <p className="text-gray-600 text-sm">
                Sanitisation HTML automatique contre les attaques XSS
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">📱 Responsive</h3>
              <p className="text-gray-600 text-sm">
                Optimisé pour tous les écrans avec design adaptatif
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
