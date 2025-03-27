// pages/api/generate-meta.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import OpenAI from 'openai';
/** 
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
*/
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1',
});

const generateMetaTags = async (title: string, content: string) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `Reformule le titre et la description, et génère les meta tags SEO pour l'article suivant :\nTitre: ${title}\nContenu: ${content}\nFournis les résultats sous le format:\nMeta Title: [Votre meta title]\nMeta Description: [Votre meta description]\nMeta Keywords: [Vos meta mots-clés]`,
      },
    ],
    max_tokens: 150,
  });

  const text = response.choices[0]?.message?.content?.trim() || '';
  const metaTitle = text.match(/Meta Title: (.+)/)?.[1] || '';
  const metaDescription = text.match(/Meta Description: (.+)/)?.[1] || '';
  const metaKeywords = text.match(/Meta Keywords: (.+)/)?.[1] || '';

  return { metaTitle, metaDescription, metaKeywords };
};

 const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const posts = await prisma.ap_posts.findMany({
        where: {
          OR: [
            {
              post_date_gmt: {
                gt: new Date('0001-01-01T00:00:00Z'),
              },
            },
            {
              post_date_gmt: {
                equals: undefined,
              },
            },
          ],
        }
    });

    for (const post of posts) {
      const { metaTitle, metaDescription, metaKeywords } = await generateMetaTags(post.post_title, post.post_content);

      await prisma.ap_metadata.upsert({
        where: { post_id: post.ID },
        update: {
          post_meta_title: metaTitle,
          post_meta_desc: metaDescription,
          post_meta_tags: metaKeywords,
        },
        //@ts-ignore
        create: {
          post_id: post.ID,
          post_meta_title: metaTitle,
          post_meta_desc: metaDescription,
          post_meta_tags: metaKeywords,
        },
      });
    }

    res.status(200).json({ message: 'Meta tags generated and stored successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while generating meta tags.' });
  }
};

export default handler