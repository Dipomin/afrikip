// pages/api/generate-sitemaps-news/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { getPostsForGoogleNews } from '../../../lib/api';

const URL = "https://www.afrikipresse.fr";
const SITEMAP_DIR = path.join(process.cwd(), 'public', 'sitemaps-news');
const SITEMAP_SIZE = 500;

type SlugData = {
  slug: string;
  publishedAt: string;
  title: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await ensureDirectoryExists(SITEMAP_DIR);

    let after: string | null = null;
    let first: number | null = null;
    let numSitemaps = 0;

    while (true) {
      const result = await fetchPostsData(SITEMAP_SIZE, after);

      if (result) {
        const validSlugs = extractValidSlugs(result);
        const { pageInfo } = result.posts;

        if (validSlugs.length > 0) {
          await createSitemap(validSlugs, numSitemaps);
          numSitemaps++;
          after = pageInfo.hasNextPage ? pageInfo.endCursor : null;
          if (!after) break;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    if (numSitemaps > 0) {
      await createSitemapIndex(numSitemaps);
    }

    res.status(200).json({ message: "Sitemaps generated successfully" });
  } catch (error) {
    console.error('Error generating sitemaps:', error);
    res.status(500).json({ error: 'Error generating sitemaps' });
  }
}

async function ensureDirectoryExists(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
    console.log(`Directory created: ${dir}`);
  }
}

async function fetchPostsData(SITEMAP_SIZE: number , after: string | null) {
  try {
    const result = await getPostsForGoogleNews(SITEMAP_SIZE, after);
    return result;
  } catch (error) {
    console.error(`Error fetching posts after cursor ${after}:`, error);
    return null;
  }
}

function extractValidSlugs(result: any): SlugData[] {
  if (result && result.posts && Array.isArray(result.posts.edges)) {
    return result.posts.edges.map((edge: any) => {
      const { slug, date, title } = edge.node;
      if (slug && date && title) {
        return { slug, publishedAt: date, title };
      } else {
        console.warn(`Missing data for node:`, JSON.stringify(edge.node, null, 2));
        return null;
      }
    }).filter(Boolean) as SlugData[];
  } else {
    console.error(`Invalid data format:`, JSON.stringify(result, null, 2));
    return [];
  }
}


async function createSitemap(slugs: SlugData[], numSitemaps: number) {
  const sitemap = generateNewsSitemap(slugs);
  const sitemapPath = path.join(SITEMAP_DIR, `sitemap-${numSitemaps + 1}.xml`);
  await fs.writeFile(sitemapPath, sitemap);
  console.log(`Sitemap written: ${sitemapPath}`);
}

async function createSitemapIndex(numSitemaps: number) {
  const sitemapIndex = generateSitemapIndex(numSitemaps);
  const indexPath = path.join(SITEMAP_DIR, 'sitemap-index.xml');
  await fs.writeFile(indexPath, sitemapIndex);
  console.log('Sitemap index written');
}

function generateNewsSitemap(slugs: SlugData[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
      ${slugs.map(slugObj => {
        const { slug, publishedAt, title } = slugObj;
        const publicationDate = new Date(publishedAt);
        const isoDate = isNaN(publicationDate.getTime()) ? '' : publicationDate.toISOString();
        return `
          <url>
            <loc>${`${URL}/article/${slug}`}</loc>
            <news:news>
              <news:publication>
                <news:name>Afrikipresse</news:name>
                <news:language>fr</news:language>
              </news:publication>
              <news:publication_date>${isoDate}</news:publication_date>
              <news:title><![CDATA[${title}]]></news:title>
            </news:news>
          </url>
        `;
      }).join("")}
    </urlset>
  `;
}

function generateSitemapIndex(numSitemaps: number) {
  let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
  `;

  for (let i = 0; i < numSitemaps; i++) {
    sitemapIndex += `
      <sitemap>
        <loc>${URL}/sitemaps-news/sitemap-${i + 1}.xml</loc>
      </sitemap>
    `;
  }

  sitemapIndex += `</sitemapindex>`;
  return sitemapIndex;
}
