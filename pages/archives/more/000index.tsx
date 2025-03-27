import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import Layout from "../../../components/layout";
import Container from "../../../components/container";
import LayoutAbonne from "../../../components/layout-abonne";
import { FaSpinner } from "react-icons/fa";

interface Article {
  guid: string;
  post_date: string;
  post_date_gmt: string;
  post_excerpt: string;
  title: string;
  ID: number;
}

interface YearData {
  year: number;
  articles: Article[];
}

const ArticlesByYearComponent = () => {
  const [articlesByYear, setArticlesByYear] = useState<YearData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const baseUrl = "/api/arch/";
      const response = await axios.get(baseUrl);
      const articlesData: YearData[] = response.data;

      console.log("Raw Articles Data:", articlesData);

      setArticlesByYear(articlesData);
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des articles :", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log("Articles par années:", articlesByYear);
  }, [articlesByYear]);

  if (isLoading) {
    return (
      <LayoutAbonne>
        <div className="flex justify-center pt-10">
          <FaSpinner size={70} color="red" className="animate-spin" />
        </div>
      </LayoutAbonne>
    );
  }

  return (
    <LayoutAbonne>
      <Container>
        <div>
          <h1 className="text-2xl font-bold">
            Archives des articles par année de publication
          </h1>
          {articlesByYear.map((yearData) => (
            <div key={yearData.year}>
              <h2 className="text-3xl font-black">{yearData.year}</h2>
              <ul>
                {yearData.articles.map((article) => (
                  <li key={article.ID} className="p-5 bg-slate-100">
                    {article.guid ? (
                      <Link href={article.guid}>
                        <p className="uppercase font-bold text-black">
                          {article.title}
                        </p>
                      </Link>
                    ) : (
                      <p className="uppercase font-bold text-black">
                        {article.title}
                      </p>
                    )}
                    {article.post_excerpt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </LayoutAbonne>
  );
};

export default ArticlesByYearComponent;
