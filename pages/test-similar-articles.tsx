import React from 'react';
import Head from 'next/head';
import SimilarArticlesDemo from '../components/similar-articles-demo';

// Page de test pour vérifier le composant SimilarArticles
const TestSimilarArticles: React.FC = () => {
  return (
    <>
      <Head>
        <title>Test - Articles Similaires | Afrikipresse</title>
        <meta name="description" content="Page de test pour le composant Articles Similaires" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <SimilarArticlesDemo />
      </div>
    </>
  );
};

export default TestSimilarArticles;
