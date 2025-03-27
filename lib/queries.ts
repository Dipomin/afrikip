import prismadb from "./prisma"

export const allPostsWithTags = async() => {
    try {
        const response = await prismadb.ap_posts.findMany({
            select: {
                post_title: true,
                post_name: true,
                post_content: true,
                post_date: true,
                
            }

        })
        console.log(response)
        return response;
    } catch (error) {
        console.log('Error retrieving posts', error)
    } finally {
        await prismadb.$disconnect;
    }
}