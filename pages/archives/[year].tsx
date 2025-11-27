import React, { useEffect, useState } from "react";
import Link from "next/link";
import Container from "../../components/container";
import { getAllPostsBeforeDecember2021 } from "../../lib/api";
import Button from "../../components/button";
import Layout from "../../components/layout";
import Image from "next/image";
import { Archive, ArrowRight } from "lucide-react";
import he from "he";
import striptags from "striptags";
import { useRouter } from "next/navigation";

interface Avatar {
  url: string;
}

interface AuthorNode {
  name: string;
  firstName: string;
  lastName: string | null;
  avatar: Avatar;
}

interface Author {
  node: AuthorNode;
}

interface CategoryNode {
  name: string;
  slug: string;
}

interface Category {
  node: CategoryNode;
}

interface FeaturedImageNode {
  sourceUrl: string;
}

interface FeaturedImage {
  node: FeaturedImageNode;
}

interface PostNode {
  title: string;
  excerpt: string;
  slug: string;
  date: string;
  featuredImage: FeaturedImage;
  author: Author;
  categories: {
    edges: Category[];
  };
}

interface Article {
  node: PostNode;
}

interface YearData {
  year: number;
  articles: Article[];
}

const ArticlesByYear = (
  { articlesByYear }: { articlesByYear: YearData },
  preview
) => {
  const [displayedArticles, setDisplayedArticles] = useState(20);

  const route = useRouter();

  return (
    <Layout preview={preview}>
      <Container>
        <div>
          <h1 className="flex font-serif justify-center space-x-3 lg:text-4xl text-2xl font-bold p-5 text-center">
            <Archive /> <span>Archives des articles Afrikipresse</span>
          </h1>

          <div>
            {articlesByYear.articles
              .slice(0, displayedArticles)
              .map((article) => (
                //@ts-ignore
                <div key={article?.slug}>
                  <div className="lg:flex flex-1">
                    <div className="pt-10">
                      {
                        <Image
                          //@ts-ignore
                          src={article.featuredImage.node.sourceUrl}
                          width={600}
                          height={450}
                          //@ts-ignore
                          alt={article?.title}
                        />
                      }
                    </div>
                    <div>
                      <ul>
                        <li
                          key={
                            //@ts-ignore
                            article?.slug
                          }
                          className="p-5 "
                        >
                          <Link
                            //@ts-ignore
                            href={`/article/${article?.slug}`}
                          >
                            <p className="text-xl uppercase font-serif font-bold text-black">
                              {
                                //@ts-ignore
                                article?.title
                              }
                            </p>
                          </Link>
                          {
                            //@ts-ignore
                            striptags(he.decode(article?.excerpt))
                          }
                        </li>
                      </ul>
                      <div className="line-clamp-3">
                        <Link
                          href={
                            //@ts-ignore
                            `/article/${article?.slug}`
                          }
                        >
                          <Button>Lire la suite</Button>
                        </Link>
                        <div>
                          {
                            //@ts-ignore
                            article?.date && (
                              <small className="text-md italic flex justify-end pr-5">
                                Publié le{" "}
                                {
                                  //@ts-ignore
                                  article.date.slice(0, 10)
                                }
                              </small>
                            )
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr />
                </div>
              ))}

            <div className="p-10 flex justify-center">
              <Button>
                {displayedArticles < articlesByYear.articles.length && (
                  <button
                    onClick={() => setDisplayedArticles(displayedArticles + 10)}
                    className="flex uppercase font-bold"
                  >
                    <span>Plus d&apos;archives</span> <ArrowRight />
                  </button>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Layout>
  );
};

export const getStaticPaths = async () => {
  const years = [2020, 2019, 2018, 2017, 2016, 2015, 2014]; // Add more years as needed
  const paths = years.map((year) => ({ params: { year: year.toString() } }));

  return { paths, fallback: false };
};

export const getStaticProps = async ({ params }) => {
  const { year } = params;
  const articlesByYear = await getAllPostsBeforeDecember2021();

  const normalizedData = articlesByYear?.edges || [];

  return {
    props: {
      articlesByYear: {
        year: parseInt(year, 10),
        articles: normalizedData.map((edge) => edge.node),
      },
    },
  };
};

export default ArticlesByYear;
