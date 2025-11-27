import React from 'react';
import Head from 'next/head';
import SimilarArticlesImageTest from '../components/similar-articles-image-test';

// Page de test pour vérifier l'affichage des images
const TestImagesSimilarArticles: React.FC = () => {
  return (
    <>
      <Head>
        <title>Test Images - Articles Similaires | Afrikipresse</title>
        <meta name="description" content="Page de test pour vérifier l'affichage des images dans les articles similaires" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <SimilarArticlesImageTest />
      </div>
    </>
  );
};

export default TestImagesSimilarArticles;
