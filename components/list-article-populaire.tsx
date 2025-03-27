import React from "react";

function ListArticlePopulaire({ articleInfo }) {
  return (
    <div>
      <h1>Liste des Articles</h1>
      <ul>
        {articleInfo.map((article, index) => (
          <li key={index}>
            <h2>{article.title}</h2>
            <p>Nombre de vues : {article.pageviews}</p>
            <a href={article.link} target="_blank" rel="noopener noreferrer">
              Lien vers l&apos;article
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListArticlePopulaire;
