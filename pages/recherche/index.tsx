// biome-ignore lint/style/useImportType: <explanation>
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "../../@/components/ui/button";
import Layout from "../../components/layout";

import Container from "../../components/container";
import { PlusCircle, Search } from "lucide-react";
import { ClipLoader } from "react-spinners";
import PopularPosts from "../../components/popular-posts";

interface Article {
  ID: string;
  title: string;
  date: string;
  excerpt: string;
  slug: string;
  content: string;
}

const SearchResults: React.FC = () => {
  const router = useRouter();
  const { keyword } = router.query;
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (keyword) {
      searchArticles(keyword as string, 1);
    }
  }, [keyword]);

  const searchArticles = async (keyword: string, page: number) => {
    setLoading(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query SearchArticles($keyword: String, $page: Int, $limit: Int) {
              searchArticles(keyword: $keyword, page: $page, limit: $limit) {
                ID
                title
                date
                excerpt
                slug
                content
              }
              totalCount(keyword: $keyword)
            }
          `,
          variables: {
            keyword,
            page,
            limit: 50,
          },
        }),
      });

      const responseBody = await response.json();

      //console.log("REPONSE DES ARTICLES", responseBody.data);
      //console.log("NOMBRE D'ARTICLES", responseBody.length);

      if (responseBody.errors) {
        console.error("API errors:", responseBody.errors);
        return;
      }

      const { searchArticles, totalCount } = responseBody.data;

      if (page === 1) {
        setArticles(searchArticles);
      } else {
        setArticles((prevArticles) => [...prevArticles, ...searchArticles]);
      }

      setTotalResults(totalCount);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
    setLoading(false);
  };

  const loadMoreArticles = () => {
    searchArticles(keyword as string, currentPage + 1);
  };

  return (
    <Layout>
      <Container>
        <div className="flex">
          <div>
            <h2 className="flex lg:text-3xl text-xl text-center uppercase text-red-600 font-extrabold font-serif">
              {keyword}
            </h2>
            <hr />
            {loading ? (
              <div className="flex flex-col items-center pb-10">
                <ClipLoader size={64} color="#ff0101" />
                <p className="text-[#ff0101]">Recherche en cours...</p>
              </div>
            ) : (
              <>
                <ul>
                  {articles.map((article) => (
                    <li key={article.ID} className="my-4">
                      <a
                        href={`/article/${article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <h3 className="text-xl font-bold hover:underline font-serif">
                          {article.title}
                        </h3>
                      </a>
                      <small>
                        Publié le {new Date(article.date).toLocaleDateString()}
                      </small>
                      <p className="line-clamp-3 my-4">{article.content}</p>
                      <hr />
                    </li>
                  ))}
                </ul>
                <div>
                  {currentPage * 50 < totalResults && (
                    <div className="flex justify-center my-6">
                      <Button onClick={loadMoreArticles} disabled={loading}>
                        Charger plus de résultats{" "}
                        <PlusCircle className="pl-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="min-w-[300px]">
            <PopularPosts />
          </div>
        </div>
      </Container>
    </Layout>
  );
};

export default SearchResults;
