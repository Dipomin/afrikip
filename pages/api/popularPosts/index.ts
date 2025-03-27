// biome-ignore lint/style/useImportType: <explanation>
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// BigInt serialization enhancement for JSON output
BigInt.prototype.toJSON = function (): string {
  return this.toString();
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Retrieve the top 10 most popular articles
    const popularArticles = await prisma.ap_popularpostssummary.findMany({
      take: 10,
      orderBy: {
        pageviews: "desc",
      },
      select: {
        postid: true,
        pageviews: true,
      },
    });

    //console.log("Articles popuplaires", popularArticles)

    // Get the details of the articles based on the IDs from the popular articles
    const articleIds = popularArticles.map(article => article.postid);
    const articleDetails = await prisma.ap_posts.findMany({
      where: {
        ID: {
          in: articleIds,
        },
      },
      select: {
        ID: true,
        post_title: true,
        post_excerpt: true,
        post_name: true,
      },
    });

    res.status(200).json(articleDetails);
  } catch (error) {
    console.error("Error fetching popular articles:", error);
    res.status(500).json({
      error: "Failed to retrieve popular articles",
    });
  }
}
