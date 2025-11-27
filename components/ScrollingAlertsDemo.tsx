import React, { useState, useEffect } from "react";
import AlertLast from "./alert-last";
import AlertTitle from "./alerte-title";

/**
 * Composant de démonstration pour les alertes avec défilement
 * Simule des données d'actualités en temps réel
 */
export default function ScrollingAlertsDemo() {
  const [currentTime, setCurrentTime] = useState(new Date().toISOString());

  // Mise à jour de l'heure toutes les minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Données de test simulant des actualités en temps réel
  const mockAlerts = [
    {
      node: {
        title: "🔴 URGENT - Élections présidentielles : résultats en temps réel",
        slug: "elections-resultats-direct",
        date: currentTime,
        categories: {
          edges: [
            { node: { slug: "politique", name: "Politique" } },
            { node: { slug: "breaking", name: "Breaking News" } }
          ]
        }
      }
    },
    {
      node: {
        title: "📈 Économie : Le PIB en hausse de 2.3% ce trimestre",
        slug: "pib-hausse-trimestre",
        date: new Date(Date.now() - 300000).toISOString(),
        categories: {
          edges: [
            { node: { slug: "economie", name: "Économie" } },
            { node: { slug: "trending", name: "Tendances" } }
          ]
        }
      }
    },
    {
      node: {
        title: "⚽ Sport : Victoire historique de l'équipe nationale en finale",
        slug: "victoire-equipe-nationale",
        date: new Date(Date.now() - 600000).toISOString(),
        categories: {
          edges: [
            { node: { slug: "sport", name: "Sport" } },
            { node: { slug: "football", name: "Football" } }
          ]
        }
      }
    },
    {
      node: {
        title: "🌍 International : Sommet diplomatique historique à Paris",
        slug: "sommet-diplomatique-paris",
        date: new Date(Date.now() - 900000).toISOString(),
        categories: {
          edges: [
            { node: { slug: "international", name: "International" } },
            { node: { slug: "diplomatie", name: "Diplomatie" } }
          ]
        }
      }
    },
    {
      node: {
        title: "💼 Dernière minute : Nouvelle réforme économique annoncée",
        slug: "reforme-economique-annoncee",
        date: new Date(Date.now() - 1200000).toISOString(),
        categories: {
          edges: [
            { node: { slug: "economie", name: "Économie" } },
            { node: { slug: "politique", name: "Politique" } }
          ]
        }
      }
    },
    {
      node: {
        title: "🔬 Sciences : Découverte révolutionnaire en médecine",
        slug: "decouverte-medicale-revolutionnaire",
        date: new Date(Date.now() - 1500000).toISOString(),
        categories: {
          edges: [
            { node: { slug: "sciences", name: "Sciences" } },
            { node: { slug: "medecine", name: "Médecine" } }
          ]
        }
      }
    },
    {
      node: {
        title: "🎭 Culture : Festival international de cinéma commence demain",
        slug: "festival-cinema-international",
        date: new Date(Date.now() - 1800000).toISOString(),
        categories: {
          edges: [
            { node: { slug: "culture", name: "Culture" } },
            { node: { slug: "cinema", name: "Cinéma" } }
          ]
        }
      }
    }
  ];

  return (
    <div className="space-y-8">
      {/* Titre de la démonstration */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Démonstration des Alertes avec Défilement
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Observez le défilement automatique de droite à gauche avec les catégories d'articles. 
          L'animation se met en pause au survol pour faciliter la lecture.
        </p>
      </div>

      {/* Barre d'alertes principale */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Barre d'alertes principale (AlertLast)
        </h3>
        <AlertLast posts={mockAlerts} />
        <p className="text-sm text-gray-500 mt-2">
          ↑ Défilement automatique avec duplication pour continuité
        </p>
      </div>

      {/* Exemples individuels */}
      <div className="grid gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Exemples d'AlertTitle avec catégories
          </h3>
          
          <div className="space-y-3">
            {/* Alerte urgente */}
            <div className="bg-black p-2 rounded">
              <AlertTitle
                title="🔴 URGENT - Situation critique en cours"
                slug="situation-critique"
                variant="urgent"
                priority="urgent"
                categories={[
                  { slug: "urgent", name: "Urgent" },
                  { slug: "breaking", name: "Breaking" }
                ]}
                timestamp={currentTime}
                showCategory={true}
              />
            </div>

            {/* Alerte breaking news */}
            <div className="bg-black p-2 rounded">
              <AlertTitle
                title="📺 Breaking : Conférence de presse du Premier Ministre"
                slug="conference-premier-ministre"
                variant="breaking"
                priority="high"
                categories={[
                  { slug: "politique", name: "Politique" },
                  { slug: "direct", name: "Direct" }
                ]}
                timestamp={new Date(Date.now() - 600000).toISOString()}
                showCategory={true}
              />
            </div>

            {/* Alerte tendance */}
            <div className="bg-black p-2 rounded">
              <AlertTitle
                title="📈 Tendance : Nouvelle technologie révolutionnaire"
                slug="technologie-revolutionnaire"
                variant="trending"
                categories={[
                  { slug: "technologie", name: "Technologie" },
                  { slug: "innovation", name: "Innovation" }
                ]}
                timestamp={new Date(Date.now() - 1200000).toISOString()}
                showCategory={true}
              />
            </div>

            {/* Alerte standard */}
            <div className="bg-black p-2 rounded">
              <AlertTitle
                title="🌍 International : Accord commercial signé entre pays"
                slug="accord-commercial-international"
                variant="default"
                categories={[
                  { slug: "international", name: "International" },
                  { slug: "economie", name: "Économie" }
                ]}
                timestamp={new Date(Date.now() - 1800000).toISOString()}
                showCategory={true}
              />
            </div>
          </div>
        </div>

        {/* Contrôles de démonstration */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">
            Fonctionnalités démontrées
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-700 mb-2">🎬 Animation</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Défilement automatique droite → gauche</li>
                <li>• Durée : 60 secondes par cycle</li>
                <li>• Pause au survol</li>
                <li>• Boucle infinie</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-700 mb-2">🏷️ Catégories</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Badge de catégorie principale</li>
                <li>• Couleur adaptée au variant</li>
                <li>• Responsive design</li>
                <li>• Extraction automatique</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-700 mb-2">📱 Responsive</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Desktop : Défilement automatique</li>
                <li>• Mobile : Carousel manuel</li>
                <li>• Tailles adaptées</li>
                <li>• Snap scroll sur mobile</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-700 mb-2">⚡ Performance</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Animations CSS hardware-accelerated</li>
                <li>• Pas de JavaScript pour l'animation</li>
                <li>• Optimisation GPU</li>
                <li>• Faible impact batterie</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Instructions d'utilisation */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Instructions d'utilisation
          </h3>
          
          <div className="prose prose-sm text-gray-600">
            <ol>
              <li><strong>Observez le défilement</strong> : Les alertes défilent automatiquement de droite à gauche</li>
              <li><strong>Survolez pour lire</strong> : L'animation se met en pause au survol de la souris</li>
              <li><strong>Cliquez sur une alerte</strong> : Navigation vers l'article complet</li>
              <li><strong>Notez les catégories</strong> : Chaque alerte affiche sa catégorie principale</li>
              <li><strong>Testez sur mobile</strong> : Défilement manuel avec snap scroll</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
