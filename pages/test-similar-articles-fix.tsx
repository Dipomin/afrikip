import React from 'react';
import Head from 'next/head';
import SimilarArticlesTest from '../components/similar-articles-test';

// Page de test pour vérifier la correction de l'erreur map
const TestSimilarArticlesFix: React.FC = () => {
  return (
    <>
      <Head>
        <title>Test Correction - Articles Similaires | Afrikipresse</title>
        <meta name="description" content="Page de test pour vérifier la correction de l'erreur map" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <SimilarArticlesTest />
      </div>
    </>
  );
};

export default TestSimilarArticlesFix;
