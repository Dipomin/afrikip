import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function fetchSevenDayPopularsPosts() {
    try {
        // Calculez la date d'il y a 7 jours à partir d'aujourd'hui
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Récupérez les 10 premiers IDs et nombres de vues des articles les plus lus depuis ap_popularpostsdata pour les 7 derniers jours
        const popularPosts = await prisma.ap_popularpostsdata.findMany({
            take: 10,
            where: {
                day: {
                    gte: sevenDaysAgo // Filtrez les articles des 7 derniers jours
                }
            },
            orderBy: {
                pageviews: 'desc' // Tri par popularité décroissante
            },
            select: {
                postid: true,
            }
        });

        // Récupérez les détails des articles correspondant aux IDs dans ap_posts
        const matchingArticles = await prisma.ap_posts.findMany({
            where: {
                ID: {
                    in: popularPosts.map((post) => post.postid) // Filtrez les articles par les IDs les plus populaires
                }
            },
            select: {
                post_title: true,
                guid: true
            }
        });

        // Formatez les données
        const formattedData = matchingArticles.map((article) => ({
            title: article.post_title,
            link: article.guid,
        }));
        return formattedData;


    } catch (error) {
        console.error('Erreur lors de la récupération des articles populaires :', error);
        return [];
    } 
}