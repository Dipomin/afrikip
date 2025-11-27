import { GetServerSideProps } from "next";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import striptags from "striptags";
import he from "he";
import Image from "next/image";

import Layout from "../../components/layout";
import Container from "../../components/container";
import Head from "next/head";
import CategoryHero from "../../components/category-hero";

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { category, page = "1" } = context.query;
  const pageSize = 50; // Matches grid layout
  const currentPage = Number(page);
  const offset = (currentPage - 1) * pageSize;

  try {
    // Count total posts for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ap_posts p
      LEFT JOIN ap_term_relationships r ON p.ID = r.object_id
      LEFT JOIN ap_term_taxonomy tt ON r.term_taxonomy_id = tt.term_taxonomy_id
      LEFT JOIN ap_terms t ON tt.term_id = t.term_id
      WHERE p.post_type = 'post' 
        AND p.post_status = 'publish'
        ${category ? `AND t.name = '${category}'` : ""}
    `;

    const countResult: any = await prisma.$queryRawUnsafe(countQuery);
    const totalPosts = Number(countResult[0].total);
    const totalPages = Math.ceil(totalPosts / pageSize);

    const query = `
      SELECT 
        p.ID,
        p.post_title,
        p.post_excerpt,
        p.post_name AS slug,
        (
          SELECT pm.meta_value 
          FROM ap_postmeta pm 
          WHERE pm.post_id = p.ID 
            AND pm.meta_key = '_thumbnail_id'
          LIMIT 1
        ) AS thumbnail_id,
        (
          SELECT pm2.meta_value 
          FROM ap_postmeta pm2 
          WHERE pm2.post_id = (
            SELECT pm.meta_value 
            FROM ap_postmeta pm 
            WHERE pm.post_id = p.ID 
              AND pm.meta_key = '_thumbnail_id'
          )
          AND pm2.meta_key = '_wp_attached_file'
          LIMIT 1
        ) AS featured_image,
        SUBSTRING(p.post_content, 1, 500) as post_content,
        p.post_date,
        t.name AS category_name
      FROM ap_posts p
      LEFT JOIN ap_term_relationships r ON p.ID = r.object_id
      LEFT JOIN ap_term_taxonomy tt ON r.term_taxonomy_id = tt.term_taxonomy_id
      LEFT JOIN ap_terms t ON tt.term_id = t.term_id
      WHERE p.post_type = 'post' 
        AND p.post_status = 'publish'
        ${category ? `AND t.name = '${category}'` : ""}
        ORDER BY p.post_date DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    const result: any = await prisma.$queryRawUnsafe(query);

    // Optimize transformation logic
    const transformedPosts = result.reduce((acc, row) => {
      const existingPost = acc.find((post) => post.ID === Number(row.ID));

      if (!existingPost) {
        acc.push({
          ID: Number(row.ID),
          post_title: row.post_title,
          post_excerpt: row.post_excerpt || "",
          slug: row.slug,
          featured_image: row.featured_image
            ? `/wp-content/uploads/${row.featured_image}`
            : "/placeholder-image.jpg",
          post_content: row.post_content,
          post_date: new globalThis.Date(row.post_date).toISOString(),
          categories: row.category_name ? [row.category_name] : [],
        });
      } else if (
        row.category_name &&
        !existingPost.categories.includes(row.category_name)
      ) {
        existingPost.categories.push(row.category_name);
      }

      return acc;
    }, []);

    // Extract unique categories efficiently
    const categories = Array.from(
      new Set(result.map((row) => row.category_name).filter(Boolean))
    );

    return {
      props: {
        posts: transformedPosts,
        totalPosts: totalPosts,
        categories,
        currentPage,
        totalPages,
        category: category || null,
      },
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return {
      props: {
        posts: [],
        categories: [],
        currentPage: 1,
        totalPages: 0,
        totalPosts: 0,
        category: null,
      },
    };
  } finally {
    await prisma.$disconnect();
  }
};

const CATEGORY_META = {
  politique: {
    title: "Actualités Politiques Africaines | Afrikipresse",
    description:
      "Suivez toute l'actualité politique africaine : élections, gouvernance, réformes et analyses politiques approfondies des pays d'Afrique.",
    keywords:
      "politique africaine, élections afrique, gouvernance, démocratie, politique",
  },
  economie: {
    title: "Actualités Économiques en Afrique | Afrikipresse",
    description:
      "Informations économiques africaines : marchés financiers, investissements, croissance économique et développement des pays africains.",
    keywords:
      "économie africaine, business afrique, finances, investissements, développement économique",
  },
  societe: {
    title: "Actualités Société et Faits de Société en Afrique | Afrikipresse",
    description:
      "Découvrez les actualités sociales et sociétales en Afrique : éducation, santé, emploi, conditions de vie et enjeux sociaux.",
    keywords:
      "société africaine, faits divers afrique, éducation, santé, social",
  },
  sport: {
    title: "Actualités Sport en Afrique | Afrikipresse",
    description:
      "Toute l'actualité sportive africaine : football, athlétisme, basketball et autres sports. Suivez les compétitions et les athlètes africains.",
    keywords: "sport afrique, football africain, CAN, athlétisme, basketball",
  },
  culture: {
    title: "Actualités Culturelles Africaines | Afrikipresse",
    description:
      "L'actualité culturelle africaine : arts, musique, cinéma, littérature et traditions. Découvrez la richesse culturelle de l'Afrique.",
    keywords: "culture africaine, arts, musique, cinéma, traditions",
  },
  afrique: {
    title: "Actualités Générales d'Afrique | Afrikipresse",
    description:
      "Suivez l'actualité générale du continent africain : politique, économie, société et développement des pays d'Afrique.",
    keywords: "afrique, actualités afrique, news afrique, continent africain",
  },
  international: {
    title: "Actualités Internationales | Afrikipresse",
    description:
      "L'actualité internationale vue d'Afrique : relations internationales, diplomatie et impact mondial sur le continent africain.",
    keywords: "international, monde, actualités internationales, diplomatie",
  },
  opinion: {
    title: "Tribune et Opinions sur l'Afrique | Afrikipresse",
    description:
      "Analyses, opinions et points de vue sur l'actualité africaine. Découvrez les tribunes et débats sur les enjeux du continent.",
    keywords: "opinions, analyses, tribunes, débats, points de vue",
  },
};

const PostsPage = ({
  posts,
  categories,
  currentPage,
  totalPages,
  category,
  totalPosts,
}) => {
  const renderPagination = () => {
    const pageNumbers: number[] = [];
    const maxPageButtons = 5;
    const halfMaxButtons = Math.floor(maxPageButtons / 2);

    let startPage = Math.max(1, currentPage - halfMaxButtons);
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i: number = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav
        className="flex justify-center items-center space-x-1 my-12"
        aria-label="Pagination"
      >
        {/* Previous Button */}
        {currentPage > 1 && (
          <Link
            href={`/categorie/${category ? `${category}?` : ""}page=${currentPage - 1}`}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Précédent
          </Link>
        )}

        {/* Page Numbers */}
        <div className="flex">
          {pageNumbers.map((number) => (
            <Link
              key={number}
              href={`/categorie/${category ? `${category}?` : ""}page=${number}`}
              className={`px-4 py-2 text-sm font-medium border-t border-b transition-colors duration-200 ${
                currentPage === number
                  ? "bg-red-600 text-white border-red-600 z-10"
                  : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50 hover:text-gray-700"
              } ${number === pageNumbers[0] && currentPage !== number ? "border-l" : ""} ${number === pageNumbers[pageNumbers.length - 1] && currentPage !== number ? "border-r" : ""}`}
            >
              {number}
            </Link>
          ))}
        </div>

        {/* Next Button */}
        {currentPage < totalPages && (
          <Link
            href={`/categorie/${category ? `${category}?` : ""}page=${currentPage + 1}`}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200"
          >
            Suivant
            <svg
              className="w-4 h-4 ml-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        )}
      </nav>
    );
  };
  const hostAdress = "https://adm.afrikipresse.fr";

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const activeCategoryMeta = category
    ? CATEGORY_META[category.toLowerCase()]
    : {
        title: "Toute l'actualité africaine | Afrikipresse",
        description:
          "Suivez toute l'actualité africaine et internationale sur Afrikipresse. Informations fiables et analyses approfondies sur l'Afrique.",
        keywords:
          "actualités afrique, news afrique, information africaine, presse africaine",
      };

  return (
    <Layout>
      <Container>
        <Head>
          <title>{activeCategoryMeta.title}</title>
          <meta name="description" content={activeCategoryMeta.description} />
          <meta name="keywords" content={activeCategoryMeta.keywords} />
          <meta property="og:title" content={activeCategoryMeta.title} />
          <meta
            property="og:description"
            content={activeCategoryMeta.description}
          />
          <meta
            property="og:url"
            content={`https://www.afrikipresse.com/categorie/${category || ""}`}
          />
          <meta property="og:site_name" content="Afrikipresse" />
          <meta property="og:type" content="website" />
          <meta property="og:image" content="/images/afrikipresse.png" />
          <meta property="og:image:alt" content="Afrikipresse" />
          <meta property="og:locale" content="fr_FR" />
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:title" content={activeCategoryMeta.title} />
          <meta
            property="twitter:description"
            content={activeCategoryMeta.description}
          />
          <meta property="twitter:image" content="/images/afrikipresse.png" />
          <meta property="twitter:image:alt" content="Afrikipresse" />
          <meta property="fb:app_id" content="692268107519885" />
          <meta property="twitter:site" content="@afrikipresse" />
          <meta property="twitter:creator" content="@afrikipresse" />
          <meta
            property="twitter:url"
            content={`https://www.afrikipresse.com/categorie/${category || ""}`}
          />
          <meta property="article:tag" content={activeCategoryMeta.keywords} />
          <meta
            property="article:section"
            content={category || "Toutes les catégories"}
          />
          <meta
            property="article:published_time"
            content={new globalThis.Date().toISOString()}
          />
          <meta property="article:author" content="Afrikipresse" />
          <meta property="article:tag" content={activeCategoryMeta.keywords} />
          <meta
            property="article:section"
            content={category || "Toutes les catégories"}
          />
          <meta name="robots" content="index, follow" />
          <link
            rel="canonical"
            href={`https://www.afrikipresse.com/categorie/${category || ""}`}
          />
        </Head>

        {/* Hero Section */}
        <CategoryHero
          category={category}
          totalPosts={totalPosts}
          description={activeCategoryMeta.description}
        />

        <article>
          <div className="container mx-auto px-4 py-8">
            {posts.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun article trouvé
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Il n'y a actuellement aucun article dans cette catégorie.
                    Revenez bientôt pour découvrir de nouveaux contenus.
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors duration-200"
                  >
                    Retour à l'accueil
                  </Link>
                </div>
              </div>
            ) : (
              /* Posts List */
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <article
                    key={post.ID}
                    className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                  >
                    {/* Featured Image */}
                    <div className="relative overflow-hidden">
                      <Image
                        src={`${hostAdress}` + post.featured_image}
                        alt={he.decode(striptags(post.post_title))}
                        width={400}
                        height={250}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-image.jpg";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Post Details */}
                    <div className="p-6">
                      {/* Categories */}
                      {post.categories.length > 0 && (
                        <div className="mb-3">
                          <span className="inline-block px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                            {post.categories[0]}
                          </span>
                        </div>
                      )}

                      <Link href={`/article/${post.slug}`}>
                        <h2 className="text-xl font-bold mb-3 hover:text-red-700 cursor-pointer font-serif line-clamp-3 transition-colors duration-200 leading-tight">
                          {he.decode(striptags(post.post_title))}
                        </h2>
                      </Link>

                      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {he.decode(striptags(post.post_excerpt)) ||
                          he.decode(
                            striptags(post.post_content.substring(0, 120))
                          ) + "..."}
                      </p>

                      {/* Post Meta */}
                      {isClient && (
                        <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-gray-100">
                          <time className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {new globalThis.Date(
                              post.post_date
                            ).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </time>
                          <Link
                            href={`/article/${post.slug}`}
                            className="text-red-600 hover:text-red-800 font-medium transition-colors duration-200"
                          >
                            Lire →
                          </Link>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && renderPagination()}
          </div>
        </article>
      </Container>
    </Layout>
  );
};

export default PostsPage;
