import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fetchArticlesGroupedByYear() {
    try {
        // Récupérez tous les articles depuis la table ap_posts
        const allArticles = await prisma.ap_posts.findMany({
            orderBy: {
                post_date: 'desc' // Tri par date de publication décroissante
            },
            select: {
                ID: true,
                post_title: true,
                post_date: true
            }
        });

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
                date: article.post_date.toISOString()
            });
        });

        // Triez les années de la plus récente à la plus ancienne
        const sortedYears = Object.keys(articlesByYear).sort((a:any, b:any) => b - a);

        // Créez un tableau final trié par année
        const sortedArticlesByYear = sortedYears.map((year) => ({
            year: parseInt(year),
            articles: articlesByYear[year]
        }));

        return sortedArticlesByYear;
    } catch (error) {
        console.error('Erreur lors de la récupération des articles :', error);
        return [];
    } finally {
        await prisma.$disconnect();
    }
}

fetchArticlesGroupedByYear().then((articlesByYear) => {
    console.log('Articles regroupés par année et triés par ordre décroissant :', articlesByYear);
});
