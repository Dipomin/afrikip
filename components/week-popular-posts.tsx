import React, { useEffect, useState } from "react";

const PopularPosts = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<{ title: string; link: string }[]>(
    []
  );
  useEffect(() => {
    // Remplacez l'URL par celle de votre API réelle
    const apiUrl = "/api/seven-day-popular-post";

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Réponse du serveur non valide");
        }

        return response.json();
      })
      .then((data) => {
        setArticles(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(
          "Erreur lors de la récupération des articles populaires :",
          error
        );
        setIsLoading(false);
      });
  }, []);

  return (
    <div>
      <h1>Articles populaires</h1>
      {isLoading ? (
        <p>Chargement en cours...</p>
      ) : (
        <ul>
          {articles.map((article) => (
            <li key={article.link}>
              <h2>{article.title}</h2>
              <a href={article.link} target="_blank" rel="noopener noreferrer">
                Lien vers l&apos;article
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PopularPosts;
