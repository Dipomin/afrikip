import { getAllPostOnlySlugs } from "../../../lib/api";
import fs from 'fs';
import path from 'path';

const URL = "https://www.afrikipresse.fr";
const SITEMAP_DIR = path.join(process.cwd(), 'public', 'sitemaps');
const SITEMAP_SIZE = 600;

export default async function handler(req: any, res: any) {
  try {
    if (!fs.existsSync(SITEMAP_DIR)) {
      fs.mkdirSync(SITEMAP_DIR, { recursive: true });
    }

    const slugs = await getAllPostOnlySlugs(); // Fetch all slugs
    let numSitemaps = getNumberOfSitemaps();
    let offset = (numSitemaps > 0 ? (numSitemaps - 1) * SITEMAP_SIZE : 0);
    let sitemapUpdated = false;

    if (numSitemaps > 0) {
      // Read the last sitemap file
      const lastSitemapPath = path.join(SITEMAP_DIR, `sitemap-${numSitemaps}.xml`);
      if (fs.existsSync(lastSitemapPath)) {
        const lastSitemapContent = fs.readFileSync(lastSitemapPath, 'utf-8');
        const lastSitemapUrls = extractUrlsFromSitemap(lastSitemapContent);

        if (lastSitemapUrls.length < SITEMAP_SIZE) {
          // Add new entries to the last sitemap
          const newEntries = slugs.slice(offset + lastSitemapUrls.length, offset + SITEMAP_SIZE);
          if (newEntries.length > 0) {
            const updatedSitemap = generateSiteMap([...lastSitemapUrls, ...newEntries]);
            fs.writeFileSync(lastSitemapPath, updatedSitemap);
            sitemapUpdated = true;
          }
        }
      } else {
        numSitemaps = 0; // Reset to 0 if the file does not exist
        offset = 0;
      }
    }

    if (!sitemapUpdated) {
      // Create new sitemaps for the remaining slugs
      while (offset < slugs.length) {
        const slugsBatch = slugs.slice(offset, offset + SITEMAP_SIZE);
        const sitemap = generateSiteMap(slugsBatch);
        const sitemapPath = path.join(SITEMAP_DIR, `sitemap-${numSitemaps + 1}.xml`);
        fs.writeFileSync(sitemapPath, sitemap);
        numSitemaps++;
        offset += SITEMAP_SIZE;
      }
    }

    // Generate static sitemap
    const staticUrls = [
      `${URL}`,
      `${URL}/a-propos/qui-sommes-nous`,
      `${URL}/a-propos/contacts`,
      `${URL}/abonnement`,
      `${URL}/categorie/politique`,
      `${URL}/categorie/economie`,
      `${URL}/categorie/sport`,
      `${URL}/categorie/international`,
      `${URL}/categorie/opinion`,
      `${URL}/categorie/afrique`,
      `${URL}/categorie/culture`,
      `${URL}/categorie/afrique`,
    ];

    const staticSitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
        ${staticUrls.map(url => `
            <url>
              <loc>${url}</loc>
            </url>
        `).join("")}
      </urlset>
    `;

    fs.writeFileSync(path.join(SITEMAP_DIR, 'static-sitemap.xml'), staticSitemap);

    // Generate sitemap index
    const sitemapIndex = generateSitemapIndex(numSitemaps);
    fs.writeFileSync(path.join(SITEMAP_DIR, 'sitemap-index.xml'), sitemapIndex);

    res.status(200).json({ message: "Sitemaps generated successfully" });
  } catch (error) {
    console.error('Error generating sitemaps:', error);
    res.status(500).json({ error: 'Error generating sitemaps' });
  }
}

function generateSiteMap(slugs: any[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
      ${slugs.map(slugObj => {
        const slug = typeof slugObj === 'string' ? slugObj : slugObj.slug || 'undefined';
        return `
          <url>
            <loc>${`https://www.afrikipresse.fr/article/${slug}`}</loc>
          </url>
        `;
      }).join("")}
    </urlset>
  `;
}

function generateSitemapIndex(numSitemaps: number) {
  let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
      <sitemap>
        <loc>${URL}/sitemaps/static-sitemap.xml</loc>
      </sitemap>
  `;

  for (let i = 0; i < numSitemaps; i++) {
    sitemapIndex += `
      <sitemap>
        <loc>${URL}/sitemaps/sitemap-${i + 1}.xml</loc>
      </sitemap>
    `;
  }

  sitemapIndex += `</sitemapindex>`;

  return sitemapIndex;
}

function getNumberOfSitemaps(): number {
  const files = fs.readdirSync(SITEMAP_DIR);
  return files.filter(file => file.startsWith('sitemap-') && file.endsWith('.xml')).length;
}

function extractUrlsFromSitemap(sitemapContent: string): string[] {
  const urls: string[] = [];
  const urlRegex = /<loc>(.*?)<\/loc>/g;
  let match: RegExpExecArray | null;
  while ((match = urlRegex.exec(sitemapContent)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}






/** 
import { getAllPostOnlySlugs } from "../../../lib/api";
import fs from 'fs';
import path from 'path';

const URL = "https://www.afrikipresse.fr";
const SITEMAP_DIR = path.join(process.cwd(), 'public', 'sitemaps');
const SITEMAP_SIZE = 600;

export default async function handler(req, res) {
  try {
    if (!fs.existsSync(SITEMAP_DIR)) {
      fs.mkdirSync(SITEMAP_DIR, { recursive: true });
    }

    let offset = 0;
    let numSitemaps = 0;
    let slugs = [];

    do {
      try {
        slugs = await getAllPostOnlySlugs({ limit: SITEMAP_SIZE, offset });
        console.log("Liste des slugs", slugs.length);

        if (slugs.length > 0) {
          const sitemap = generateSiteMap(slugs);
          const sitemapPath = path.join(SITEMAP_DIR, `sitemap-${numSitemaps + 1}.xml`);
          fs.writeFileSync(sitemapPath, sitemap);
          numSitemaps++;
          offset += SITEMAP_SIZE;
        }
      } catch (error) {
        console.error(`Error fetching slugs at offset ${offset}:`, error);
        break;
      }
    } while (slugs.length > 0);

    const staticUrls = [
      `${URL}`,
      `${URL}/a-propos/qui-sommes-nous`,
      `${URL}/a-propos/contacts`,
      `${URL}/abonnement`,
      `${URL}/categorie/politique`,
      `${URL}/categorie/economie`,
      `${URL}/categorie/sport`,
      `${URL}/categorie/international`,
      `${URL}/categorie/opinion`,
      `${URL}/categorie/afrique`,
      `${URL}/categorie/culture`,
      `${URL}/categorie/afrique`,
    ];

    const staticSitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
        ${staticUrls.map(url => `
            <url>
              <loc>${url}</loc>
            </url>
        `).join("")}
      </urlset>
    `;

    fs.writeFileSync(path.join(SITEMAP_DIR, 'static-sitemap.xml'), staticSitemap);

    const sitemapIndex = generateSitemapIndex(numSitemaps);
    fs.writeFileSync(path.join(SITEMAP_DIR, 'sitemap-index.xml'), sitemapIndex);

    res.status(200).json({ message: "Sitemaps generated successfully" });
  } catch (error) {
    console.error('Error generating sitemaps:', error);
    res.status(500).json({ error: 'Error generating sitemaps' });
  }
}

function generateSiteMap(slugs) {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
      ${slugs.map(slugObj => {
        const slug = typeof slugObj === 'string' ? slugObj : slugObj.slug || 'undefined';
        return `
          <url>
            <loc>${`https://www.afrikipresse.fr/article/${slug}`}</loc>
          </url>
        `;
      }).join("")}
    </urlset>
  `;
}

function generateSitemapIndex(numSitemaps) {
  let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
      <sitemap>
        <loc>${URL}/sitemaps/static-sitemap.xml</loc>
      </sitemap>
  `;

  for (let i = 0; i < numSitemaps; i++) {
    sitemapIndex += `
      <sitemap>
        <loc>${URL}/sitemaps/sitemap-${i + 1}.xml</loc>
      </sitemap>
    `;
  }

  sitemapIndex += `</sitemapindex>`;

  return sitemapIndex;
}
*/