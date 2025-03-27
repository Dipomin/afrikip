
const API_URL = process.env.WORDPRESS_API_URL

async function fetchAPI(query = '', { variables }: Record<string, any> = {}) {
  const headers = { 'Content-Type': 'application/json' }

  if (process.env.WORDPRESS_AUTH_REFRESH_TOKEN) {
    headers[
      'Authorization'
    ] = `Bearer ${process.env.WORDPRESS_AUTH_REFRESH_TOKEN}`
  }

  // WPGraphQL Plugin must be enabled
  const res = await fetch(API_URL!, {
    headers,
    method: 'POST',
    body: JSON.stringify({
      query,
      variables,
    }),
  })


  const json = await res.json()
  if (json.errors) {
    console.error(json.errors)
    throw new Error('Failed to fetch API')
  }
  return json.data
}

export async function getPreviewPost(id, idType = 'DATABASE_ID') {
  const data = await fetchAPI(
    `
    query PreviewPost($id: ID!, $idType: PostIdType!) {
      post(id: $id, idType: $idType) {
        databaseId
        slug
        status
        view_count {
          viewCount
        }
      }
    }`,
    {
      variables: { id, idType },
    }
  )
  return data.post
}

export async function getAllPostsWithSlug() {
  const data = await fetchAPI(`
    {
      posts(first: 14000) {
        edges {
          node {
            slug
          }
        }
      }
    }
  `)
  return data?.posts
}
// lib/api.ts
export async function getAllPostOnlySlugs() {
  const batchSize = 14000; // Nombre d'articles à récupérer à la fois
  let allSlugs = [];
  let endCursor = null;

  do {
    const data = await fetchAPI(`
      {
        posts(first: ${batchSize}, after: "${endCursor}") {
          edges {
            node {
              slug
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    `);

    const posts = data?.posts.edges || [];
    allSlugs = allSlugs.concat(posts.map(({ node }) => node.slug));
    endCursor = data?.posts.pageInfo.endCursor;
  } while (endCursor);

  return allSlugs;
}


export async function getAllPostsForHome(preview) {
  const data = await fetchAPI(
    `
    query AllPosts {
      posts(first: 2000, where: {orderby: {field: DATE, order: DESC}}) {
        edges {
          node {
            title
            excerpt
            slug
            date
            featuredImage {
              node {
                sourceUrl
              }
            }
            author {
              node {
                name
                firstName
                lastName
                avatar {
                  url
                }
              }
            }
            categories {
              edges {
                node {
                  name
                  slug
                }
              }
            }
          }
        }
      }
    }
  `, 
    {
      variables: {
        onlyEnabled: !preview,
        preview,
      },
    }
    )
    
    
  return data?.posts 
} 

export async function getPostAndMorePosts(slug, preview, previewData) {
  const postPreview = preview && previewData?.post
  // The slug may be the id of an unpublished post
  const isId = Number.isInteger(Number(slug))
  const isSamePost = isId
    ? Number(slug) === postPreview.id
    : slug === postPreview.slug
  const isDraft = isSamePost && postPreview?.status === 'draft'
  const isRevision = isSamePost && postPreview?.status === 'publish'
  const data = await fetchAPI(
    `
    fragment AuthorFields on User {
      name
      firstName
      lastName
      avatar {
        url
      }
    }
    fragment PostFields on Post {
      title
      excerpt
      slug
      date
      featuredImage {
        node {
          sourceUrl
        }
      }
      abonnes {
        abonnes
      }
      author {
        node {
          ...AuthorFields
        }
      }
      categories {
        edges {
          node {
            name
          }
        }
      }
      tags {
        edges {
          node {
            name
            slug
          }
        }
      }
    }
    query PostBySlug($id: ID!, $idType: PostIdType!) {
      post(id: $id, idType: $idType) {
        ...PostFields
        content
        ${
          // Only some of the fields of a revision are considered as there are some inconsistencies
          isRevision
            ? `
        revisions(first: 1, where: { orderby: { field: MODIFIED, order: DESC } }) {
          edges {
            node {
              title
              excerpt
              content
              abonnes {
                abonnes
              }
              view_count {
                viewCount
              }
              author {
                node {
                  ...AuthorFields
                }
              }
            }
          }
        }
        `
            : ''
        }
      }
      posts(first: 6, where: { orderby: { field: DATE, order: DESC } }) {
        edges {
          node {
            ...PostFields
            abonnes {
              abonnes
            }
          }
        }
      }
    }
  `,
    {
      variables: {
        id: isDraft ? postPreview.id : slug,
        idType: isDraft ? 'DATABASE_ID' : 'SLUG',
      },
    }
  )

  // Draft posts may not have an slug
  if (isDraft) data.post.slug = postPreview.id
  // Apply a revision (changes in a published post)
  if (isRevision && data.post.revisions) {
    const revision = data.post.revisions.edges[0]?.node

    if (revision) Object.assign(data.post, revision)
    delete data.post.revisions
  }

  // Filter out the main post
  data.posts.edges = data.posts.edges.filter(({ node }) => node.slug !== slug)
  // If there are still 3 posts, remove the last one
  //if (data.posts.edges.length > 11) data.posts.edges.pop()


  return data
}

export async function getCategorySlugs() {
  const data = await fetchAPI(   
    `
      query getCategorySlugs {
        categories(first: 5000) {
          nodes {
            slug
          }
        }
      } 
    `)
  const categories = data?.categories.nodes;

  return categories;

  
}


export async function getPostList(endCursor: string | null = null, taxonomy: { key: string; value: string } | null = null) {
  
  const buildCondition = () => {
    let condition = `after: "${endCursor}", first: 100, where: {orderby: {field: DATE, order: DESC}}`;
    if (taxonomy?.key && taxonomy.value) {
      condition = `after: "${endCursor}", first: 100, where: {orderby: {field: DATE, order: DESC}, ${taxonomy.key}: "${taxonomy.value}"}`;
    }
    return condition;
  };

  try {
    const condition = buildCondition();
    const variables = {
      endCursor: endCursor || '',
      taxonomyValue: taxonomy?.value || ''
    }
    const data = await fetchAPI(`
      query getAllPosts {
        posts(${condition}) {
          nodes {
            date
            slug
            title
            excerpt(format: RENDERED)
            featuredImage {
              node {
                mediaDetails {
                  file
                  sizes {
                    sourceUrl
                    width
                    height
                  }
                }
              }
            }
            categories {
              nodes {
                name
                slug
              }
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    `, variables);

    if (!data?.posts?.nodes) {
      console.error("Invalid data format:", data);
      return [];
    }

    return {
      nodes: data.posts.nodes,
      endCursor: data.posts.pageInfo.endCursor || null,
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function getCategorieDetails(categorieName) {
      const data = await fetchAPI(
        `
        query getCategorieDetails {
          category(id: "${categorieName}", idType: SLUG) {
            count
            slug
            name
          }
        }
        `
      )
      const categorieDetails = data?.category;

      return categorieDetails;
    }

export async function getPolitiquePosts() {
      const data = await fetchAPI(
        `
        query getPolitiquePosts {
          categories(where: {name: "politique"}) {
            nodes {
              posts(first: 100) {
                edges {
                  node {
                    title
                    excerpt
                    slug
                    featuredImage {
                      node {
                        sourceUrl
                      }
                    }
                  }
                }
              }
            }
          }
        }
        `
      )
      const politiqueLastPosts = data?.categories;

      return politiqueLastPosts;
    }

export async function getEconomiePosts() {
      const data = await fetchAPI(
        `
        query getEconomiePosts {
          posts(first: 5, where: {categoryName: "economie"}) {
            edges {
              node {
                title
                slug
                featuredImage {
                  node {
                    sourceUrl
                  }
                }
              }
            }
          }
        }
        `
      )
      const economieLastPosts = data?.posts;

      return economieLastPosts;
    }


    export async function getAllPosts(preview, first = 2000, after = null) {
      const data = await fetchAPI(
        `
        query AllPosts($first: Int, $after: String) {
          posts(first: $first, after: $after, where: { orderby: { field: DATE, order: DESC } }) {
            edges {
              node {
                title
                excerpt
                slug
                date
                featuredImage {
                  node {
                    sourceUrl
                  }
                }
                author {
                  node {
                    name
                    firstName
                    lastName
                    avatar {
                      url
                    }
                  }
                }
                categories {
                  edges {
                    node {
                      name
                      slug
                    }
                  }
                }
              }
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      `,
        {
          variables: {
            first,
            after,
          },
        }
      );
    
      return data?.posts;
    }
    

    export async function getAllPostsBeforeDecember2021(first = 5000, after = null) {

      try {

        const data = await fetchAPI(
          `
          query AllPosts($first: Int, $after: String) {
            posts(
              first: $first
              after: $after
              where: {orderby: {field: DATE, order: DESC}, dateQuery: {before: {year: 2021, month: 12, day: 31}}}
            ) {
              edges {
                node {
                  title
                  excerpt
                  slug
                  date
                  featuredImage {
                    node {
                      sourceUrl
                    }
                  }
                  author {
                    node {
                      name
                      firstName
                      lastName
                      avatar {
                        url
                      }
                    }
                  }
                  categories {
                    edges {
                      node {
                        name
                        slug
                      }
                    }
                  }
                }
              }
              pageInfo {
                endCursor
                hasNextPage
              }
            }
          }
        `,
          {
            variables: {
              first,
              after,
            },
          }
        );
      
        return data?.posts;

      } catch(error) {
        console.error("Error fetching posts:", error);
    return [];
      }
      
    }

  export async function getAllPostsToFilter(first = 20, after: string | null | undefined = null, maxItems = 1000) {
    const posts: any[] = [];
    let hasNextPage = true;
    let currentAfter = after;
  
    try {
      // Performance optimization: Use a more aggressive maximum first value
      const safeFirst = Math.min(Math.max(first, 1), 50);
  
      while (hasNextPage && posts.length < maxItems) {
        // Add timeout to prevent infinite loops
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API fetch timeout')), 10000)
        );
  
        const fetchPromise = fetchAPI(
          `
          query AllPosts($first: Int, $after: String) {
            posts(first: $first, after: $after, where: {orderby: {field: DATE, order: DESC}}) {
              edges {
                node {
                  title
                  excerpt
                  slug
                  date
                  featuredImage {
                    node {
                      sourceUrl
                    }
                  }
                  author {
                    node {
                      name
                      firstName
                      lastName
                      avatar {
                        url
                      }
                    }
                  }
                  categories {
                    edges {
                      node {
                        name
                        slug
                      }
                    }
                  }
                }
                cursor
              }
              pageInfo {
                endCursor
                hasNextPage
              }
            }
          }
          `,
          {
            variables: {
              first: safeFirst,
              after: currentAfter ?? null,
            },
          }
        );
  
        // Use Promise.race to implement timeout
        const data = await Promise.race([fetchPromise, timeoutPromise]);
  
        // Enhanced validation
        if (!data?.posts?.edges) {
          console.warn('Invalid or empty posts data received');
          break;
        }
  
        // Advanced data cleaning and type safety
        const cleanedEdges = data.posts.edges.map(edge => ({
          node: {
            title: edge.node.title?.trim() || 'Untitled',
            excerpt: edge.node.excerpt?.trim() || '',
            slug: edge.node.slug || '',
            date: edge.node.date ? new Date(edge.node.date).toISOString() : new Date().toISOString(),
            featuredImage: {
              node: {
                sourceUrl: edge.node.featuredImage?.node?.sourceUrl || null
              }
            },
            author: {
              node: {
                name: edge.node.author?.node?.name || 'Unknown Author',
                firstName: edge.node.author?.node?.firstName || '',
                lastName: edge.node.author?.node?.lastName || '',
                avatar: {
                  url: edge.node.author?.node?.avatar?.url || '/default-avatar.png'
                }
              }
            },
            categories: {
              edges: (edge.node.categories?.edges || []).map(cat => ({
                node: {
                  name: cat.node.name || 'Uncategorized',
                  slug: cat.node.slug || 'uncategorized'
                }
              }))
            }
          }
        }));
  
        // Performance logging with more detailed insights
        console.debug(`Batch fetch: ${cleanedEdges.length} posts. Total: ${posts.length + cleanedEdges.length}`);
  
        posts.push(...cleanedEdges);
  
        // Update pagination info
        hasNextPage = data.posts.pageInfo.hasNextPage || false;
        currentAfter = data.posts.pageInfo.endCursor;
  
        // Prevent unnecessary iterations
        if (!hasNextPage || posts.length >= maxItems) break;
      }
  
      return {
        edges: posts,
        pageInfo: {
          endCursor: currentAfter,
          hasNextPage,
          total: posts.length
        }
      };
  
    } catch (error) {
      // Advanced error logging and handling
      console.error('Post fetching error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'UnknownError',
        stack: error instanceof Error ? error.stack : null
      });
  
      return {
        edges: [],
        pageInfo: {
          endCursor: null,
          hasNextPage: false,
          total: 0
        },
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          name: error instanceof Error ? error.name : 'UnknownError',
          stack: error instanceof Error ? error.stack : null,
          details: error
        }
      };
    }
  }

    export async function getPostsByTag(tagSlug: string) {
      const query = `
        query PostsByTag($tagSlug: String!) {
          posts(where: { tagSlug: $tagSlug }) {
            edges {
              node {
                title
                excerpt
                slug
                date
                tags {
                  edges {
                    node {
                      name
                      slug
                    }
                  }
                }
                featuredImage {
                  node {
                    sourceUrl
                  }
                }
                author {
                  node {
                    name
                    firstName
                    lastName
                    avatar {
                      url
                    }
                  }
                }
                categories {
                  edges {
                    node {
                      name
                      slug
                    }
                  }
                }
              }
            }
          }
        }
      `;
    
      const variables = { tagSlug };
    
      const data = await fetchAPI(query, { variables });
    
      const posts = data?.posts.edges.map(({ node }) => node);
    
      //console.log("Posts fetched by tag:", posts);
    
      return posts;
    }
    
    export async function getPostsForTags(tagSlug, preview, cursor = null) {
      const trimmedTagSlug = tagSlug.trim();
    
      const data = await fetchAPI(
        `
          query PostsByTag($tagSlugs: [String], $cursor: String) {
            posts(first: 100, after: $cursor, where: { tagSlugIn: $tagSlugs }) {
              edges {
                node {
                  slug
                  title
                  date
                  author {
                    node {
                      name
                    }
                  }
                  excerpt
                  featuredImage {
                    node {
                      sourceUrl
                    }
                  }
                  tags {
                    edges {
                      node {
                        slug
                      }
                    }
                  }
                }
              }
              pageInfo {
                endCursor
                hasNextPage
              }
            }
          }
        `,
        {
          variables: { tagSlugs: [trimmedTagSlug], cursor },
          preview,
        }
      );
    
      //console.log("API response for posts by tag:", data);
    
      if (!data || !data.posts) {
        throw new Error("Invalid data structure for posts");
      }
    
      return data.posts;
    }
    
    
    export async function getPostsTags() {
      const data = await fetchAPI(
        `
        query AllPostsTags {
    posts {
      edges {
        node {
          tags {
            edges {
              node {
                slug
              }
            }
          }
        }
      }
    }
  }
        `
      );
      return data;
    } 
    
    export async function getAllTags() {
      try {
        const data = await fetchAPI(
          `
            query AllTags {
              tags(last: 100, where: {}) {
                edges {
                  node {
                    slug
                    name
                    posts {
                      edges {
                        node {
                          slug
                        }
                      }
                    }
                  }
            }
          }
        }
          `
        )
    
        //console.log("API response for all tags:", data);
    
        // Validate the structure of the data
        if (!data || !data.tags || !Array.isArray(data.tags.edges)) {
          throw new Error("Invalid data structure");
        }
    
        // Filter tags that have associated posts
        return data.tags.edges
          .map(edge => edge.node)
          .filter(node => node && node.slug && node.posts.edges.length > 0);
      } catch (error) {
        console.error("Error fetching tags:", error);
        return []; // Return an empty array in case of error
      }
    }




    
    export async function getPostsForGoogleNews(first: number, after: string | null) {
      try {
        const query = `
          query getPosts($first: Int, $after: String) {
            posts(first: $first, after: $after) {
              edges {
                node {
                  id
                  title
                  slug
                  date
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `;
        const data = await fetchAPI(query, { "1" : "100" });
        console.log(`Fetched data with cursor ${after}:`, JSON.stringify(data, null, 2));
        return data;
      } catch (error) {
        console.error(`Error in getPostsForGoogleNews with cursor ${after}:`, error);
        throw error;
      }
    }
    
// lib/api.ts or a similar file

export interface Post {
  postId: number;
  slug: string;
  title: string;
}

export interface TagNode {
  slug: string;
  name: string;
  tagId: number;
  posts: {
    nodes: Post[];
  };
  link: string;
}

export interface TagsResponse {
  tags: {
    edges: {
      node: TagNode;
    }[];
  };
}


    export async function GetTagsWithPosts(): Promise<TagsResponse> {
      try {
        const data = await fetchAPI(`
          query {
            tags {
              edges {
                node {
                  slug
                  name
                  tagId
                  posts {
                    nodes {
                      postId
                      slug
                      title
                    }
                  }
                  link
                }
              }
              nodes {
                posts {
                  nodes {
                    postId
                    slug
                    title
                  }
                }
              }
            }
            }
          }
        `);
        return data;
      } catch (error: any) {
        console.error('Error fetching tags with posts:', error);
        throw error;
      }
    }
    