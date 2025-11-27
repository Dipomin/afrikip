import React from "react";
import AlertTitle from "./alerte-title";

/**
 * Composant de démonstration pour AlertTitle
 * Montre toutes les variantes et options disponibles
 */
export default function AlertTitleShowcase() {
  const sampleTitle = "Dernière minute : Nouvelle importante en cours";
  const sampleSlug = "nouvelle-importante-en-cours";
  const currentTime = new Date().toISOString();

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          AlertTitle - Composant Moderne
        </h1>

        {/* Variantes */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Variantes</h2>
          <div className="bg-black p-4 rounded-lg space-y-2">
            <AlertTitle
              title="Alerte par défaut"
              slug={sampleSlug}
              variant="default"
            />
            <AlertTitle
              title="Alerte urgente avec animation"
              slug={sampleSlug}
              variant="urgent"
              priority="urgent"
            />
            <AlertTitle
              title="Breaking News avec dégradé"
              slug={sampleSlug}
              variant="breaking"
              priority="high"
            />
            <AlertTitle
              title="Tendance du moment"
              slug={sampleSlug}
              variant="trending"
              category="trending"
            />
          </div>
        </section>

        {/* Tailles */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Tailles</h2>
          <div className="bg-black p-4 rounded-lg space-y-2">
            <AlertTitle title="Petite taille" slug={sampleSlug} size="sm" />
            <AlertTitle
              title="Taille par défaut"
              slug={sampleSlug}
              size="default"
            />
            <AlertTitle title="Grande taille" slug={sampleSlug} size="lg" />
          </div>
        </section>

        {/* Avec timestamp et catégories */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Avec horodatage et catégories
          </h2>
          <div className="bg-black p-4 rounded-lg space-y-2">
            <AlertTitle
              title="Alerte avec catégorie et heure"
              slug={sampleSlug}
              timestamp={currentTime}
              variant="breaking"
              categories={[
                { slug: "politique", name: "Politique" },
                { slug: "breaking", name: "Breaking" },
              ]}
              showCategory={true}
            />
            <AlertTitle
              title="Urgent avec catégorie sport"
              slug={sampleSlug}
              timestamp={currentTime}
              variant="urgent"
              priority="urgent"
              categories={[
                { slug: "sport", name: "Sport" },
                { slug: "urgent", name: "Urgent" },
              ]}
              showCategory={true}
            />
            <AlertTitle
              title="Économie en tendance"
              slug={sampleSlug}
              timestamp={currentTime}
              variant="trending"
              categories={[
                { slug: "economie", name: "Économie" },
                { slug: "trending", name: "Tendance" },
              ]}
              showCategory={true}
            />
          </div>
        </section>

        {/* Sans icône */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Sans icône</h2>
          <div className="bg-black p-4 rounded-lg space-y-2">
            <AlertTitle
              title="Alerte sans icône"
              slug={sampleSlug}
              showIcon={false}
            />
          </div>
        </section>

        {/* Non cliquable */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Non cliquable</h2>
          <div className="bg-black p-4 rounded-lg space-y-2">
            <AlertTitle
              title="Alerte non cliquable"
              isClickable={false}
              variant="trending"
            />
          </div>
        </section>

        {/* Bordures arrondies */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Bordures arrondies
          </h2>
          <div className="bg-black p-4 rounded-lg space-y-2">
            <AlertTitle title="Sans arrondi" slug={sampleSlug} rounded="none" />
            <AlertTitle title="Arrondi moyen" slug={sampleSlug} rounded="md" />
            <AlertTitle title="Très arrondi" slug={sampleSlug} rounded="lg" />
          </div>
        </section>

        {/* Exemple d'utilisation */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Exemple d'utilisation
          </h2>
          <div className="bg-gray-900 p-4 rounded-lg">
            <pre className="text-green-400 text-sm overflow-x-auto">
              {`// Utilisation basique
<AlertTitle 
  title="Titre de l'alerte" 
  slug="article-slug" 
/>

// Avec toutes les options
<AlertTitle
  title="Alerte urgente"
  slug="article-urgent"
  variant="urgent"
  size="lg"
  priority="urgent"
  timestamp={new Date().toISOString()}
  showIcon={true}
  isClickable={true}
  className="custom-class"
/>`}
            </pre>
          </div>
        </section>

        {/* Animation de défilement */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Animation de défilement
          </h2>
          <div className="bg-black p-4 rounded-lg overflow-hidden">
            <div className="flex animate-scroll-right whitespace-nowrap">
              <AlertTitle
                title="🔴 URGENT - Élections : résultats en direct"
                slug="elections-direct"
                variant="urgent"
                priority="urgent"
                categories={[{ slug: "politique", name: "Politique" }]}
                timestamp={currentTime}
                showCategory={true}
              />
              <AlertTitle
                title="📈 Économie : PIB en hausse"
                slug="pib-hausse"
                variant="trending"
                categories={[{ slug: "economie", name: "Économie" }]}
                timestamp={currentTime}
                showCategory={true}
              />
              <AlertTitle
                title="⚽ Sport : Victoire historique"
                slug="victoire-sport"
                variant="breaking"
                categories={[{ slug: "sport", name: "Sport" }]}
                timestamp={currentTime}
                showCategory={true}
              />
            </div>
            <p className="text-white text-sm mt-2 opacity-75">
              ↑ Animation de défilement automatique (pause au survol)
            </p>
          </div>
          <style jsx>{`
            @keyframes scroll-right {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }
            .animate-scroll-right {
              animation: scroll-right 30s linear infinite;
            }
            .animate-scroll-right:hover {
              animation-play-state: paused;
            }
          `}</style>
        </section>

        {/* Simulation d'utilisation réelle */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Simulation réelle
          </h2>
          <div className="bg-black p-4 rounded-lg">
            <div className="flex flex-wrap gap-2">
              <AlertTitle
                title="🔴 DIRECT - Élections présidentielles : résultats en temps réel"
                slug="elections-resultats-direct"
                variant="urgent"
                priority="urgent"
                timestamp={currentTime}
                size="lg"
              />
              <AlertTitle
                title="📈 Économie : Le PIB en hausse de 2.3% ce trimestre"
                slug="pib-hausse-trimestre"
                variant="trending"
                category="trending"
                timestamp={currentTime}
              />
              <AlertTitle
                title="⚽ Sport : Victoire historique de l'équipe nationale"
                slug="victoire-equipe-nationale"
                variant="breaking"
                priority="high"
                timestamp={currentTime}
              />
              <AlertTitle
                title="🌍 International : Sommet diplomatique à Paris"
                slug="sommet-diplomatique-paris"
                variant="default"
                timestamp={currentTime}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
