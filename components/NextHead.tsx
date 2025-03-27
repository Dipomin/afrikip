import Head from "next/head";

const NextHead = () => {
  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" href="https://www.afrikipresse.com/favicon.png" />
      <title>Afrikipresse</title>
      <meta
        name="description"
        content="Suivez toute l'actualité africaine et dans le monde"
      />
      <meta
        property="twitter:image"
        content="https://www.afrikipresse.com/default.png"
      />
      <meta property="twitter:card" content="summary_large_image" />
      <meta
        property="twitter:title"
        content="Suivez toute l'actualité africaine et dans le monde"
      />
      <meta
        property="twitter:description"
        content="Suivez toute l'actualité africaine et dans le monde"
      />
      <meta
        property="og:image"
        content="https://www.afrikipresse.com/default.png"
      />
      <meta property="og:title" content="Afrikipresse" />
      <meta
        property="og:description"
        content="Suivez toute l'actualité africaine et dans le monde"
      />
      <meta property="og:url" content="https://www.afrikipresse.com" />
    </Head>
  );
};

export default NextHead;
