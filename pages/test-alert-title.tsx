import React from "react";

import Layout from "../components/layout";
import Container from "../components/container";
import AlertTitleShowcase from "../components/AlertTitleShowcase";
import AlertLast from "../components/alert-last";
import ScrollingAlertsDemo from "../components/ScrollingAlertsDemo";
import { Meta } from "../components/meta";

/**
 * Page de test pour démontrer les améliorations du composant AlertTitle
 * Cette page peut être supprimée en production
 */
export default function TestAlertTitle() {
  // Données de test pour AlertLast
  const testPosts = [
    {
      node: {
        title:
          "🔴 URGENT - Élections présidentielles : résultats en temps réel",
        slug: "elections-resultats-direct",
        date: new Date().toISOString(),
        categories: {
          edges: [
            { node: { slug: "breaking", name: "Breaking News" } },
            { node: { slug: "politique", name: "Politique" } },
          ],
        },
      },
    },
    {
      node: {
        title: "📈 Économie : Le PIB en hausse de 2.3% ce trimestre",
        slug: "pib-hausse-trimestre",
        date: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        categories: {
          edges: [
            { node: { slug: "trending", name: "Tendances" } },
            { node: { slug: "economie", name: "Économie" } },
          ],
        },
      },
    },
    {
      node: {
        title: "⚽ Sport : Victoire historique de l'équipe nationale",
        slug: "victoire-equipe-nationale",
        date: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        categories: {
          edges: [{ node: { slug: "sport", name: "Sport" } }],
        },
      },
    },
    {
      node: {
        title: "🌍 International : Sommet diplomatique à Paris",
        slug: "sommet-diplomatique-paris",
        date: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
        categories: {
          edges: [{ node: { slug: "international", name: "International" } }],
        },
      },
    },
    {
      node: {
        title:
          "Dernière minute : Nouvelle réforme annoncée par le gouvernement",
        slug: "reforme-gouvernement",
        date: new Date(Date.now() - 1200000).toISOString(), // 20 minutes ago
        categories: {
          edges: [{ node: { slug: "politique", name: "Politique" } }],
        },
      },
    },
  ];

  return (
    <div>
      <Meta
        postTitle="Test AlertTitle - Composant Moderne"
        ogImage="https://www.afrikipresse.com/default.png"
        postExcerptDecoded="Page de test pour démontrer les améliorations du composant AlertTitle"
        postTags="test, composant, alertes"
        ogUrl="https://www.afrikipresse.com/test-alert-title"
        publishedTime=""
        articleAuthor=""
        articleSection=""
      />

      <Layout>
        {/* Barre d'alertes en action */}
        <AlertLast posts={testPosts} />

        <Container>
          <div className="py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Test du Composant AlertTitle Amélioré
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Cette page démontre les nouvelles fonctionnalités et
                améliorations apportées au composant AlertTitle. Vous pouvez
                voir la barre d'alertes en action ci-dessus et explorer toutes
                les variantes ci-dessous.
              </p>
            </div>

            {/* Démonstration des nouvelles fonctionnalités */}
            <ScrollingAlertsDemo />

            {/* Showcase complet */}
            <AlertTitleShowcase />

            {/* Section d'informations techniques */}
            <div className="mt-16 bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Améliorations Techniques
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    🔒 Sécurité
                  </h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Sanitisation HTML contre les attaques XSS</li>
                    <li>• Validation des props TypeScript</li>
                    <li>• Protection contre les scripts malveillants</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    ♿ Accessibilité
                  </h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Attributs ARIA complets</li>
                    <li>• Navigation clavier optimisée</li>
                    <li>• Support des lecteurs d'écran</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    🎨 Design & Animation
                  </h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>• 4 variantes visuelles</li>
                    <li>• Défilement automatique droite → gauche</li>
                    <li>• Affichage des catégories d'articles</li>
                    <li>• Animations CSS fluides</li>
                    <li>• Design responsive</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    ⚡ Performance
                  </h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Optimisation avec class-variance-authority</li>
                    <li>• Lazy loading des icônes</li>
                    <li>• Animations GPU-accelerated</li>
                    <li>• Pause animation au survol</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Code d'exemple */}
            <div className="mt-12 bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Exemple d'utilisation
              </h3>
              <pre className="text-green-400 text-sm overflow-x-auto">
                {`import AlertTitle from "../components/alerte-title";

// Utilisation basique
<AlertTitle
  title="Titre de l'alerte"
  slug="article-slug"
/>

// Avec catégories et défilement
<AlertTitle
  title="🔴 URGENT - Élections : résultats"
  slug="elections-resultats"
  variant="urgent"
  priority="urgent"
  timestamp={new Date().toISOString()}
  categories={[
    { slug: "politique", name: "Politique" },
    { slug: "breaking", name: "Breaking" }
  ]}
  showCategory={true}
  enableScrolling={true}
  size="lg"
/>`}
              </pre>
            </div>

            {/* Note de développement */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Note de développement
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Cette page de test peut être supprimée en production. Elle
                      sert uniquement à démontrer les nouvelles fonctionnalités
                      du composant AlertTitle refactorisé.
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
