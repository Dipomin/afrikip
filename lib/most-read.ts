export async function getMostRead() {

    const res = await fetch('https://afrikipresse-preprod-dipomin.vercel.app/api/popularPosts');
    
    if(!res.ok) {
        throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`)
    }
    
    const mostRead = res.json;

    return mostRead;
}