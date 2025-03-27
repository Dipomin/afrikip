import { useRouter } from "next/router";
import ErrorPage from "next/error";
import { GetStaticPaths, GetStaticProps } from "next";
import { useEffect, useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { createClient } from "@supabase/supabase-js";
import { Analytics } from "@vercel/analytics/react";
import he from "he";
import striptags from "striptags";
import readingTime from "reading-time";
import { Timer } from "lucide-react";
import { FacebookProvider } from "react-facebook";

// Components
import Layout from "../../components/layout";
import Container from "../../components/container";
import PostBody from "../../components/post-body";
import PostHeader from "../../components/post-header";
import SectionSeparator from "../../components/section-separator";
import Tags from "../../components/tags";
import Avatar from "../../components/avatar";
import Date from "../../components/date";
import AdBanner from "../../components/ab-banner";
import { Meta } from "../../components/meta";
import RelatedPosts from "../../components/related-posts";
import FacebookComment from "../../components/facebook-comment";
import MoreCategorie from "../../components/more-categorie";

// Utils & Constants
import {
  getAllPostsWithSlug,
  getCategorieDetails,
  getCategorySlugs,
  getPostAndMorePosts,
  getPostList,
} from "../../lib/api";
import { URL_ARTICLE } from "../../lib/constants";
import { Database } from "../../types_db";
import SocialShareButtons from "../../components/social-share-buttons";

// Types
interface PostProps {
  post: any;
  posts: any;
  preview: boolean;
  relatedPosts: any[];
  categoriePosts: any;
  categorieDetails: any;
}

const Post: React.FC<PostProps> = ({
  post,
  posts,
  preview,
  relatedPosts,
  categoriePosts,
  categorieDetails,
}) => {
  const router = useRouter();
  const user = useUser();
  const userId = user?.id;

  // States
  const [article, setArticle] = useState<string>(post.content);
  const [statusAbonne, setStatusAbonne] = useState<string | null>(null);
  const [catPosts, setCatPosts] = useState(categoriePosts);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize Supabase client
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  // Reading time calculation
  const readingStats = readingTime(article);
  const readingMinutes = Math.round(readingStats.minutes);

  // URL and metadata preparation
  const url = `https://www.afrikipresse.fr/article/${post.slug}`;
  const ogUrl = URL_ARTICLE + post?.slug;
  const urlImage = post.featuredImage?.node?.sourceUrl;
  const postExcerpt = he.decode(striptags(post.excerpt.slice(0, 200)));
  const postTags = post?.tags?.edges?.map(({ node }: any) => node?.name) || [];
  const articleCat = post.categories.edges.map(
    (category: any) => category.node.name
  );

  useEffect(() => {
    setIsMounted(true);
    
    // Prevent copy-paste
    const preventCopyPaste = (e: Event) => {
      e.preventDefault();
      return false;
    };

    document.documentElement.addEventListener("copy", preventCopyPaste);
    document.documentElement.addEventListener("paste", preventCopyPaste);
    document.documentElement.addEventListener("contextmenu", preventCopyPaste);

    return () => {
      document.documentElement.removeEventListener("copy", preventCopyPaste);
      document.documentElement.removeEventListener("paste", preventCopyPaste);
      document.documentElement.removeEventListener("contextmenu", preventCopyPaste);
    };
  }, []);

  useEffect(() => {
    const checkSubscriptionStatus = async (userId: string) => {
      if (!userId) return;

      try {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("id", userId)
          .single();

        if (userError || !userData) {
          console.error("User verification failed:", userError);
          return;
        }

        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from("subscriptions")
          .select("status")
          .eq("user_id", userId)
          .single();

        if (subscriptionError) {
          console.error("Subscription check failed:", subscriptionError);
          return;
        }

        setStatusAbonne(subscriptionData?.status || "Pas d'abonnement actif");
      } catch (error) {
        console.error("Subscription check error:", error);
      }
    };

    if (userId) checkSubscriptionStatus(userId);
  }, [userId, supabase]);

  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }

  const filteredPosts = Array.isArray(catPosts)
    ? catPosts.filter((catPost) =>
        catPost.categories.nodes.some(
          (node: any) => node.slug === categorieDetails?.slug
        )
      )
    : [];

  return (
    <>
      <Meta
        postTitle={post.title}
        ogImage={urlImage}
        postExcerptDecoded={postExcerpt}
        postTags={postTags}
        ogUrl={ogUrl}
        publishedTime={post.date}
        articleAuthor={`${post.author?.node?.firstName} ${post.author?.node?.lastName}`}
        articleSection={articleCat}
      />
      
      <Layout preview={preview} user={userId}>
        <Container>
          <Analytics />
          <article className="max-w-4xl mx-auto">
            <div className="lg:mx-10">
              <PostHeader
                title={post.title}
                coverImage={post.featuredImage}
                date={post.date}
                author={post.author}
                categories={post.categories}
              />
            </div>

            <div className="flex flex-col space-y-4 lg:space-y-6">
              {/* Article Meta Information */}
              <div className="flex flex-wrap items-center gap-2 text-sm lg:text-base">
                <span>Publié le</span>
                <Date dateString={post.date} />
                <span>•</span>
                <span>Par</span>
                <Avatar author={post.author} />
                <span>•</span>
                <div className="flex items-center">
                  <Timer className="w-4 h-4 mr-1" />
                  <span>Lecture {readingMinutes} minutes</span>
                </div>
              </div>

              {/* Social Share Buttons */}
              <SocialShareButtons url={ogUrl} title={post.title} />

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
                <div>
                  <PostBody
                    content={article.replace(
                      "https://afrikipresse.fr",
                      "https://www.afrikipresse.fr/article"
                    )}
                  />
                  
                  {/* Facebook Comments */}
                  <div className="mt-10">
                    <h3 className="text-xl font-semibold mb-4">
                      Réagir à l&apos;article
                    </h3>
                    <FacebookProvider
                      appId={process.env.FACEBOOK_APP_ID || ""}
                    >
                      <FacebookComment
                        appId={process.env.FACEBOOK_APP_ID}
                        url={url}
                      />
                    </FacebookProvider>
                  </div>
                </div>

                {/* Sidebar */}
                <aside className="bg-slate-100/50 p-4 rounded-lg">
                  <h2 className="text-xl font-bold mb-6">
                    Publiés récemment
                  </h2>
                  {relatedPosts.length > 0 && (
                    <MoreCategorie posts={relatedPosts} />
                  )}
                </aside>
              </div>

              {/* Advertisement */}
              <AdBanner
                data-ad-slot="2499770324"
                data-ad-format="auto"
                data-full-width-responsive="true"
              />

              {/* Tags */}
              <footer>
                {post.tags.edges.length > 0 && <Tags tags={post.tags} />}
              </footer>

              {/* Related Posts */}
              <SectionSeparator />
              <div className="max-w-sm p-4">
                <h2 className="text-2xl font-bold mb-6">
                  À lire aussi
                </h2>
                {filteredPosts.length > 0 && (
                  <RelatedPosts posts={filteredPosts} />
                )}
              </div>
            </div>
          </article>
        </Container>
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  try {
    const categoriePosts = params?.categoryName
      ? await getPostList(null, undefined)
      : await getPostList(null, null);

    const categorieDetails = await getCategorieDetails(params?.categoryName);
    const data = await getPostAndMorePosts(params?.slug, preview, previewData);

    return {
      props: {
        preview,
        post: data.post,
        posts: data.posts,
        categoriePosts,
        relatedPosts: data.posts.edges,
        categorieDetails,
      },
    };
  } catch (error) {
    console.error("Error in getStaticProps:", error);
    return {
      notFound: true,
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const allPosts = await getAllPostsWithSlug();
    await getCategorySlugs(); // Fetch categories for future use

    return {
      paths: allPosts.edges.map(({ node }) => `/article/${node.slug}`) || [],
      fallback: "blocking",
    };
  } catch (error) {
    console.error("Error in getStaticPaths:", error);
    return {
      paths: [],
      fallback: "blocking",
    };
  }
};

export default Post;
