import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function fetchArticlesGroupedByYear(req, res) {
    try {
        // Récupérez tous les articles depuis la table ap_posts
        const allArticles = await prisma.ap_posts.findMany({
            orderBy: {
                post_date: 'desc' // Tri par date de publication décroissante
            },
            select: {
                ID: true,
                post_title: true,
                post_date: true,
                post_excerpt: true,
                post_content: true,
            },
            take: 14000
            
        });

        console.log("Nombre d'articles:", allArticles.length)

        // Créez un objet pour grouper les articles par année
        const articlesByYear = {};

        // Parcourez tous les articles et regroupez-les par année
        allArticles.forEach((article) => {
            const year = article.post_date.getFullYear();
            if (!articlesByYear[year]) {
                articlesByYear[year] = [];
            }
            articlesByYear[year].push({
                ID: article.ID,
                title: article.post_title,
                date: article.post_date.toISOString(),
                excerpt: article.post_excerpt
            });
        });

        //const stringifyBigInts = (key, value) => typeof value === 'bigint' ? value.toString() : value;
        //const stringifiedObject = JSON.parse(JSON.stringify(articlesByYear, stringifyBigInts));

        const stringifyBigInts = (key, value) => {
            if (typeof value === 'bigint') {
                return value.toString();
            }
            return value;
        };
        
        // Triez les années de la plus récente à la plus ancienne
        const sortedYears = Object.keys(articlesByYear).sort((a:any, b:any) => b - a);

        // Créez un tableau final trié par année
        const sortedArticlesByYear = sortedYears.map((year) => ({year: parseInt(year), articles: articlesByYear[year]}));
        
        console.log(sortedArticlesByYear)

        const jsonString = JSON.stringify(sortedArticlesByYear, stringifyBigInts);

        res.status(200).json(JSON.parse(jsonString));
    } catch (error) {
        console.error('Erreur lors de la récupération des articles :', error);
        res.status(500).json({error: 'Erreur serveur lors de la récupération des articles'});
    } finally {
        await prisma.$disconnect();
    }
    //console.log('Articles regroupés par année et triés par ordre décroissant :', articlesByYear);
}

