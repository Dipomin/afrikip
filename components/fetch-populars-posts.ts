import axios from "axios";

export async function fetchPopularsPosts() {
    try {
        const response = await axios.get('https://afrikipresse.fr/wp-json/wp/v2/posts', {
            params: {
                
                order_by: 'meta_value_num',
                meta_key: 'pageviews',
                order: 'desc',
                per_page: 10
            }
        }
        );
        return response.data
    } catch(error) {
        console.error('Erreur lors de la récupération des articles populaires :', error)
        return [];
    }
}
