const URL = "https://www.afrikipresse.fr";

export async function getServerSideProps({ res }) {
  try {
    await fetch(`${URL}/api/generate-sitemaps`);

    const sitemapIndex = await fetch(`${URL}/sitemaps/sitemap-index.xml`);
    const sitemapText = await sitemapIndex.text();

    res.setHeader("Content-Type", "text/xml");
    res.write(sitemapText);
    res.end();

    return {
      props: {},
    };
  } catch (error) {
    console.error('Error fetching sitemap index:', error);
    return {
      props: {},
    };
  }
}

export default function SiteMap() {
  return null;
}
