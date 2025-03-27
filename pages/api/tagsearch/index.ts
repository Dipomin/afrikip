import { ApolloServer, gql } from 'apollo-server-micro';
import { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'micro-cors';
import striptags from 'striptags';
import he from 'he';
import prismadb from '../../../lib/prisma'; // Adjust the import based on your project structure

const typeDefs = gql`
  type Article {
    ID: ID!
    title: String!
    date: String!
    excerpt: String
    content: String
    slug: String!
  }

  type Query {
    searchArticles(keyword: String, page: Int, limit: Int): [Article]
    totalCount(keyword: String): Int
  }
`;

const resolvers = {
  Query: {
    searchArticles: async (_, { keyword, page = 1, limit = 50 }) => {
      const offset = (page - 1) * limit;

      try {
        const articles: any = await prismadb.$queryRaw`
          SELECT *
          FROM ap_posts
          WHERE
            (LOWER(post_title) LIKE ${`%${keyword.toLowerCase()}%`}
            OR LOWER(post_excerpt) LIKE ${`%${keyword.toLowerCase()}%`}
            OR LOWER(post_content) LIKE ${`%${keyword.toLowerCase()}%`})
            AND post_status = 'publish'
          ORDER BY post_date DESC
          LIMIT ${limit}
          OFFSET ${offset}
        `;

        return articles.map(article => ({
          ID: article.ID.toString(),
          title: he.decode(striptags(article.post_title)),
          date: new Date(article.post_date).toISOString(),
          excerpt: striptags(article.post_excerpt),
          content: he.decode(striptags(article.post_content)),
          slug: article.post_name
        }));
      } catch (error) {
        console.error("Error fetching articles:", error);
        throw new Error("Error fetching articles");
      }
    },
    totalCount: async (_, { keyword }) => {
      try {
        const count: any = await prismadb.$queryRaw`
          SELECT COUNT(*) as count
          FROM ap_posts
          WHERE
            (LOWER(post_title) LIKE ${`%${keyword.toLowerCase()}%`}
            OR LOWER(post_excerpt) LIKE ${`%${keyword.toLowerCase()}%`}
            OR LOWER(post_content) LIKE ${`%${keyword.toLowerCase()}%`})
            AND post_status = 'publish'
        `;

        return parseInt(count[0].count, 10);
      } catch (error) {
        console.error("Error fetching total count:", error);
        throw new Error("Error fetching total count");
      }
    }
  }
};

const cors = Cors();

let apolloServer: ApolloServer;

const startServer = async () => {
  apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start();
};

export default cors(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!apolloServer) {
    await startServer();
  }

  if (req.method === 'OPTIONS') {
    res.end();
    return false;
  }

  const apolloHandler = apolloServer.createHandler({ path: '/api/tagsearch' });
  return apolloHandler(req, res);
});

export const config = {
  api: {
    bodyParser: false,
  },
};
