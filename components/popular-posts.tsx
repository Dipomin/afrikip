// components/PopularArticles.tsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import he from "he";
import striptags from "striptags";

interface Article {
  ID: string; // Changer le type de ID en string
  post_title: string;
  post_excerpt: string;
  post_name: string;
  pageview: number;
}

const PopularPosts = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);

  useEffect(() => {
    axios
      .get("/api/popularPosts")
      .then((response) => {
        if (response.data.length > 0) {
          const articlesWithConvertedID = response.data.map(
            (article: Article) => ({
              ...article,
              ID: article.ID,
            })
          );
          //console.log("Response API:", articles);
          setArticles(articlesWithConvertedID);
        } else {
          console.error("Les données de l'API ne sont pas au format attendu.");
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des articles :", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get("/api/getAllPosts")
      .then((response) => {
        if (response.data.length > 0) {
          const articlesWithConvertedID = response.data.map(
            (article: Article) => ({
              ...article,
              ID: article.ID,
            })
          );

          console.log(
            "Articles With Converted ID:",
            articlesWithConvertedID.length
          );
          console.log("Response API:", articles.length);

          setAllArticles(articlesWithConvertedID);
        } else {
          console.error("Les données de l'API ne sont pas au format attendu.");
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des articles :", error);
      });
  }, [articles]);

  console.log("Number of all articles:", allArticles.length);

  return (
    <div>
      <h2 className="text-2xl font-black p-3">Les plus lus</h2>
      <ul>
        {articles.map((article) => (
          <li
            key={article.ID}
            className="p-3 border hover:underline hover:text-zinc-400"
          >
            <Link
              href={`/article/${article.post_name}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong>{he.decode(striptags(article.post_title))}</strong>
              <p>{article.post_excerpt}</p>
              <p>{article.pageview}</p>
              <div className="flex justify-end items-end ">
                <span className="bg-red-600 text-white p-1 rounded-sm">
                  {" "}
                  Lire l&apos;article{" "}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PopularPosts;
