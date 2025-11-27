import { useRouter } from "next/router";
import ErrorPage from "next/error";
import { GetStaticPaths, GetStaticProps } from "next";
import {
  Loader2,
  Timer,
  Share2,
  BookOpen,
  Calendar,
  User,
  Tag,
  Eye,
  Clock,
} from "lucide-react";
import readingTime from "reading-time";
import React, { useEffect, useState, useMemo } from "react";
import { FacebookProvider } from "react-facebook";
import he from "he";
import striptags from "striptags";
import dynamic from "next/dynamic";
import Head from "next/head";

import Container from "../../components/container";
import PostBody from "../../components/post-body";
import Layout from "../../components/layout";
import { getAllPostsWithSlug, getPostAndMorePosts } from "../../lib/api";
import { URL_ARTICLE } from "../../lib/constants";
import Avatar from "../../components/avatar";
import DateComponent from "../../components/date";
import MoreCategorie from "../../components/more-categorie";

import AdBanner from "../../components/ab-banner";
import { Meta } from "../../components/meta";
import ReadingProgress from "../../components/reading-progress";
import SimilarArticles from "../../components/similar-articles";
import Link from "next/link";

export const revalidate = 3600;

const postBody = dynamic(() => import("../../components/post-body"), {
  ssr: false,
});

const SocialShareButtons = dynamic(
  () => import("../../components/social-share-buttons"),
  {
    ssr: false,
  }
);

const FacebookComment = dynamic(
  () => import("../../components/facebook-comment"),
  {
    ssr: false,
  }
);

const RelatedPosts = dynamic(() => import("../../components/related-posts"), {
  ssr: false,
});

type Article = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  categories: { nodes: { slug: string }[] };
};

interface Post {
  title: string;
  content: string;
  slug: string;
  excerpt: string;
  tags: string;
  date: string;
  author: string;
  featuredImage: {
    url: string;
    alt: string;
  } | null;
  categories: Array<{
    name: string;
    slug: string;
  }>;
}

type PostListResponse =
  | Article[]
  | { nodes: Article[]; endCursor: string | null };

// Fonction pour générer les données structurées JSON-LD
const generateStructuredData = (
  post: Post,
  url: string,
  readingTimeStats: any
) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: he.decode(striptags(post.title)),
    description: he.decode(striptags(post.excerpt.slice(0, 200))),
    image: post.featuredImage?.url || "https://www.afrikipresse.fr/default.png",
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: post.author || "Afrikipresse",
    },
    publisher: {
      "@type": "Organization",
      name: "Afrikipresse",
      logo: {
        "@type": "ImageObject",
        url: "https://www.afrikipresse.fr/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    articleSection: post.categories[0]?.name || "Actualités",
    keywords: post.categories.map((cat) => cat.name).join(", "),
    wordCount: readingTimeStats.words,
    timeRequired: `PT${Math.round(readingTimeStats.minutes)}M`,
    inLanguage: "fr-FR",
    isAccessibleForFree: true,
    url: url,
  };

  return structuredData;
};

const Post = ({ post, relatedPosts }) => {
  const router = useRouter();
  const [article, setArticle] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [viewCount, setViewCount] = useState<number>(0);
  const url = `https://www.afrikipresse.fr/article/${post?.slug}` || "";
  const statRead = useMemo(() => readingTime(article), [article]);
  const articleRef = React.useRef<HTMLElement>(null);

  useEffect(() => {
    if (post?.content) {
      setArticle(post.content);
    }
  }, [post]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const preventCopyPaste = (e: any) => {
      e.preventDefault();
    };

    document.documentElement.addEventListener("cut", preventCopyPaste);
    document.documentElement.addEventListener("copy", preventCopyPaste);
    document.documentElement.addEventListener("paste", preventCopyPaste);
    document.documentElement.addEventListener("contextmenu", preventCopyPaste);
    return () => {
      document.documentElement.removeEventListener("cut", preventCopyPaste);
      document.documentElement.removeEventListener("copy", preventCopyPaste);
      document.documentElement.removeEventListener("paste", preventCopyPaste);
      document.documentElement.addEventListener(
        "contextmenu",
        preventCopyPaste
      );
    };
  }, []);

  if (router.isFallback) {
    return (
      <div className="flex justify-center items-center h-screen w-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        Chargement...
      </div>
    );
  }

  const ogUrl = URL_ARTICLE + post?.slug;
  const urlImage = post.featuredImage?.url;

  //console.log("INFO AUTEUR", post.author);

  const postTags: Array<{ node: { name: string } }> = post.tags.map(
    ({ node }) => node
  );

  const postExcerpt = he.decode(striptags(post.excerpt.slice(0, 200)));
  const publishedTime = post.date;
  const postTitle = post.title;
  const articleAuthor =
    post.author?.node?.firstName && post.author?.node?.lastName;
  const articleSection = post.category;
  const articleCat = post.categories[0]?.name || "";

  const datePublication = publishedTime.slice(0, 10);
  const structuredData = generateStructuredData(post, url, statRead);

  // Composant d'en-tête d'article moderne
  const ArticleHeader = () => (
    <header className="mb-8">
      {/* Breadcrumb */}
      <nav
        className="flex items-center space-x-2 text-sm text-gray-600 mb-4"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-cyan-600 transition-colors">
          Accueil
        </Link>
        <span>›</span>
        {post.categories[0] && (
          <>
            <Link
              href={`/categorie/${post.categories[0].slug}`}
              className="hover:text-cyan-600 transition-colors"
            >
              {post.categories[0].name}
            </Link>
            <span>›</span>
          </>
        )}
        <span className="text-gray-400 truncate">
          {he.decode(striptags(post.title.slice(0, 50)))}
        </span>
      </nav>

      {/* Catégories */}
      {post.categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.categories.map((category, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 hover:bg-cyan-200 transition-colors"
            >
              <Tag className="w-3 h-3 mr-1" />
              {category.name}
            </span>
          ))}
        </div>
      )}

      {/* Titre principal */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-6 font-sans">
        {he.decode(striptags(post.title))}
      </h1>

      {/* Extrait */}
      {post.excerpt && (
        <p className="text-xl text-gray-600 leading-relaxed mb-6 font-light">
          {he.decode(striptags(post.excerpt.slice(0, 200)))}
        </p>
      )}

      {/* Métadonnées de l'article */}
      <div className="flex flex-wrap items-center gap-6 py-4 border-t border-b border-gray-200 bg-gray-50 px-4 rounded-lg">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-cyan-600" />
          <span>Publié le</span>
          <DateComponent dateString={post.date} />
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <User className="w-4 h-4 mr-2 text-cyan-600" />
          <span>Par</span>
          <Avatar author={post.author} />
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2 text-cyan-600" />
          <span>{Math.round(statRead.minutes)} min de lecture</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <BookOpen className="w-4 h-4 mr-2 text-cyan-600" />
          <span>{statRead.words} mots</span>
        </div>

        {viewCount > 0 && (
          <div className="flex items-center text-sm text-gray-600">
            <Eye className="w-4 h-4 mr-2 text-cyan-600" />
            <span>{viewCount.toLocaleString("fr-FR")} vues</span>
          </div>
        )}
      </div>
    </header>
  );

  return (
    <>
      <ReadingProgress target={articleRef} />
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </Head>
      <Meta
        postTitle={postTitle}
        ogImage={urlImage}
        postExcerptDecoded={postExcerpt}
        postTags={postTags}
        ogUrl={ogUrl}
        publishedTime={publishedTime}
        articleAuthor={articleAuthor}
        articleSection={articleCat}
      />
      <Layout>
        <Container>
          <article ref={articleRef} className="max-w-4xl mx-auto">
            <ArticleHeader />

            {/* Image principale */}
            {post.featuredImage?.url && (
              <div className="mb-8 overflow-hidden rounded-xl shadow-lg">
                <img
                  src={post.featuredImage.url}
                  alt={
                    post.featuredImage.alt || he.decode(striptags(post.title))
                  }
                  className="w-full h-auto object-cover rounded-md"
                  loading="eager"
                />
              </div>
            )}

            {/* Boutons de partage */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-4 bg-white shadow-md rounded-full px-6 py-3 border">
                <Share2 className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Partager :
                </span>
                <SocialShareButtons url={url} title={post.title} />
              </div>
            </div>

            {/* Contenu principal */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Contenu de l'article */}
              <div className="lg:col-span-3">
                {isClient && article && (
                  <div className="prose prose-lg max-w-none">
                    <PostBody content={article} />
                  </div>
                )}

                {/* Section de partage en bas d'article */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6">
                    <div className="mb-4 sm:mb-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Cet article vous a plu ?
                      </h3>
                      <p className="text-gray-600">
                        Partagez-le avec vos amis et collègues
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <SocialShareButtons url={url} title={post.title} />
                    </div>
                  </div>
                </div>

                {/* Section commentaires */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="bg-cyan-100 p-2 rounded-lg mr-3">💬</span>
                    Réagir à l'article
                  </h3>
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <FacebookProvider appId={process.env.FACEBOOK_APP_ID || ""}>
                      <FacebookComment
                        appId={process.env.FACEBOOK_APP_ID}
                        url={url}
                      />
                    </FacebookProvider>
                  </div>
                </div>

                {/* Publicité */}
                <div className="mt-12">
                  <AdBanner
                    data-ad-slot="2499770324"
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-8">
                  {/* Articles récents avec design enrichi */}
                  <div className="bg-gradient-to-br from-blue-50 via-purple-50/30 to-pink-50/20 rounded-2xl p-6 shadow-xl border-2 border-blue-100 hover:border-purple-200 transition-all duration-500">
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-6 flex items-center">
                      
                      Articles récents
                    </h2>
                    {relatedPosts.length > 0 && (
                      <MoreCategorie posts={relatedPosts} />
                    )}
                  </div>

                  
                </div>
              </div>
            </div>

            {/* Section Articles Similaires */}
            <SimilarArticles
              currentPost={{
                slug: post.slug,
                categories: post.categories,
                title: post.title,
              }}
              relatedPosts={relatedPosts}
              className="mt-16"
            />
          </article>
        </Container>
      </Layout>
    </>
  );
};

export default Post;

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
}) => {
  if (!params?.slug) {
    return {
      notFound: true,
    };
  }

  try {
    const data = await getPostAndMorePosts(
      params?.slug as string,
      preview,
      null
    );

    //console.log("DATA POST TAGS AND MORE POSTS", data.post);
    //console.log("AUTHOR DATA", data.post.author.node?.name);

    const post: Post = {
      content: data.post.content || "",
      excerpt: data.post.excerpt || "",
      title: data.post.title || "",
      slug: data.post.slug || "",
      date: data.post.date || "",
      author: data.post.author.node?.name || "",
      tags: data.post.tags.edges || "",
      featuredImage: data.post.featuredImage
        ? {
            url: data.post.featuredImage.node?.sourceUrl || "",
            alt: data.post.featuredImage.node?.altText || "",
          }
        : null,
      categories:
        data.post.categories?.edges?.map((edge) => ({
          name: edge.node.name || "",
          slug: edge.node.slug || "",
        })) || [],
    };

    //console.log("SLUG SLUG", data.post.slug);

    if (!post.slug) {
      console.log("Post is missing", post);
      return { notFound: true };
    }

    return {
      props: {
        preview: preview || false,
        post,
        posts: data.posts || null,
        relatedPosts: data.posts?.edges || [],
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.log("Error fetching posts:", error);
    return { notFound: true };
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const allPosts = await getAllPostsWithSlug();

    return {
      paths: allPosts.edges?.map(({ node }) => `/article/${node.slug}`) || [],
      fallback: true,
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return {
      paths: [],
      fallback: false,
    };
  }
};
