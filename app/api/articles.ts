// pages/api/articles.js
import { NextApiRequest, NextApiResponse } from "next";

import { PrismaClient } from "@prisma/client";

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function (): string {
  return this.toString();
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const prisma = new PrismaClient();

  try {
    // Récupérez tous les articles depuis la base de données
    const articles = await prisma.ap_posts.findMany({
      // Ajoutez d'autres options de requête selon vos besoins
      take: 1000,
      orderBy: {
        post_date_gmt: 'desc'
      },
      select: {
        ID: true,
        guid: true,
        post_title: true,
        post_date: true,
        post_date_gmt: true,
        post_excerpt: true,
        post_content: true,
      }
    });

    // Fermez la connexion à la base de données
   // await prisma.$disconnect();

    res.status(200).json(articles);
    //console.log("Article depuis db:", articles)
  } catch (error) {
    console.error("Erreur lors de la récupération des articles :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des articles" });
  }
}
