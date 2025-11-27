import { GetStaticProps } from "next";
import Layout from "../components/layout";
import Container from "../components/container";
import { Meta } from "../components/meta";
import JournalArchive from "../components/journal-archives";

const SEO_DATA = {
  title: "Archives Journaux - Afrikipresse",
  description:
    "Consultez tous nos journaux numériques depuis 2009. Achetez à l'unité ou abonnez-vous pour un accès illimité.",
  image: "https://www.afrikipresse.fr/og-journaux.png",
  tag: "journaux, archives, PDF, éditions numériques",
  url: "https://www.afrikipresse.fr/journaux",
};

export default function JournauxPage() {
  return (
    <div>
      <Meta
        postTitle={SEO_DATA.title}
        ogImage={SEO_DATA.image}
        postExcerptDecoded={SEO_DATA.description}
        postTags={SEO_DATA.tag}
        ogUrl={SEO_DATA.url}
        publishedTime=""
        articleAuthor=""
        articleSection=""
      />
      <Layout>
        <Container>
          <div className="py-8">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Archives des Journaux
              </h1>
              <p className="text-lg text-gray-600">
                Explorez notre collection complète de journaux numériques depuis
                2009.
              </p>
            </div>

            <JournalArchive />
          </div>
        </Container>
      </Layout>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
    revalidate: 3600, // Revalider toutes les heures
  };
};
