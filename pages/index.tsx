import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/fr.json";

import {
  getAllPostsForHome,
  getEconomiePosts,
  getPolitiquePosts,
} from "../lib/api";
import Container from "../components/container";
import Layout from "../components/layout";
import HomeInterPreview from "../components/home-inter-preview";
import AlertLast from "../components/alert-last";
import LintelligentTv from "../components/lintelligent-tv";
import { Meta } from "../components/meta";
import { GetStaticProps } from "next/types";
import { usePreventCopyPaste } from "../hooks/usePreventCopyPaste";
import {
  useCategoryPosts,
  useMainNewsSections,
} from "../hooks/useCategoryPosts";
import CategorySection from "../components/CategorySection";
import MainNewsSection from "../components/MainNewsSection";
import PDFCtaSection from "../components/pdf-cta-section";

// Configuration des catégories
const CATEGORIES_CONFIG = {
  politique: { limit: 16, title: "Politique" },
  societe: { limit: 16, title: "Société" },
  economie: { limit: 16, title: "Économie" },
  sport: { limit: 16, title: "Sport" },
  afrique: { limit: 10000, title: "Afrique" },
  culture: { limit: 30, title: "Culture" },
  international: { limit: 4, title: "Opinion" },
  opinion: { limit: 10, title: "Opinion" },
} as const;

// Métadonnées SEO
const SEO_DATA = {
  title: "Afrikipresse - L'actualité africaine et en Côte d'Ivoire",
  description:
    "Afrikipresse couvre toute l'actualité d'Afrique, avec des reportages et des décryptages sur les événements du continent.",
  image: "https://www.afrikipresse.fr/default.png",
  author: "Afrikipresse",
  tag: "Afrikipresse",
  url: "https://www.afrikipresse.fr",
} as const;

export default function Index({ allPosts: { edges }, preview }) {
  // Utilisation du hook pour prévenir le copier-coller
  usePreventCopyPaste();

  // Configuration de TimeAgo
  TimeAgo.addDefaultLocale(en);

  // Organisation des actualités principales
  const { heroPosts, newsTwo, newsThree, newsFour, newsFive, alertNews } =
    useMainNewsSections(edges);

  // Posts par catégorie en utilisant le hook personnalisé
  const politiquePosts = useCategoryPosts(
    edges,
    "politique",
    CATEGORIES_CONFIG.politique.limit
  );
  const societePosts = useCategoryPosts(
    edges,
    "societe",
    CATEGORIES_CONFIG.societe.limit
  );
  const economiePosts = useCategoryPosts(
    edges,
    "economie",
    CATEGORIES_CONFIG.economie.limit
  );
  const sportPosts = useCategoryPosts(
    edges,
    "sport",
    CATEGORIES_CONFIG.sport.limit
  );
  const afriquePosts = useCategoryPosts(
    edges,
    "afrique",
    CATEGORIES_CONFIG.afrique.limit
  );
  const culturePosts = useCategoryPosts(
    edges,
    "culture",
    CATEGORIES_CONFIG.culture.limit
  );
  const internationalPosts = useCategoryPosts(
    edges,
    "opinion",
    CATEGORIES_CONFIG.international.limit
  );

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
        {alertNews.length > 0 && <AlertLast posts={alertNews} />}

        <Container>
          <MainNewsSection
            heroPosts={heroPosts}
            newsTwo={newsTwo}
            newsThree={newsThree}
            newsFour={newsFour}
            newsFive={newsFive}
          />

          <div className="border-b-[1px]">
            <LintelligentTv />
          </div>

          {/* Sections de catégories */}
          <CategorySection
            title={CATEGORIES_CONFIG.politique.title}
            mainPosts={politiquePosts.main}
            listOnePosts={politiquePosts.listOne}
            listTwoPosts={politiquePosts.listTwo}
            miniPosts={politiquePosts.mini}
          />

          <CategorySection
            title={CATEGORIES_CONFIG.societe.title}
            mainPosts={societePosts.main}
            listOnePosts={societePosts.listOne}
            listTwoPosts={societePosts.listTwo}
            miniPosts={societePosts.mini}
            showPronostic={true}
          />

          <CategorySection
            title={CATEGORIES_CONFIG.economie.title}
            mainPosts={economiePosts.main}
            listOnePosts={economiePosts.listOne}
            listTwoPosts={economiePosts.listTwo}
            miniPosts={economiePosts.mini}
          />

          <CategorySection
            title={CATEGORIES_CONFIG.sport.title}
            mainPosts={sportPosts.main}
            listOnePosts={sportPosts.listOne}
            listTwoPosts={sportPosts.listTwo}
            miniPosts={sportPosts.mini}
          />

          <CategorySection
            title={CATEGORIES_CONFIG.afrique.title}
            mainPosts={afriquePosts.main}
            listOnePosts={afriquePosts.listOne}
            listTwoPosts={afriquePosts.listTwo}
            miniPosts={afriquePosts.mini}
            showMini={false}
          />

          <CategorySection
            title={CATEGORIES_CONFIG.culture.title}
            mainPosts={culturePosts.main}
            listOnePosts={culturePosts.listOne}
            listTwoPosts={culturePosts.listTwo}
            miniPosts={culturePosts.mini}
            showMini={false}
          />

          <div className="border-b-2 border-cyan-950">
            <div className="text-2xl font-extrabold pt-6 pb-3 pl-3">
              Opinion
            </div>
            <div className="grid grid-cols-1 lg:flex">
              <div>
                {internationalPosts.main.length > 0 && (
                  <HomeInterPreview posts={internationalPosts.main} />
                )}
              </div>
            </div>
          </div>
        </Container>
      </Layout>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const allPosts = await getAllPostsForHome(preview);
  const politiqueLastPosts = await getPolitiquePosts();
  const economieLastPosts = await getEconomiePosts();

  return {
    revalidate: 3600,
    props: { allPosts, preview, politiqueLastPosts, economieLastPosts },
  };
};
