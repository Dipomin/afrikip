import { useRouter } from "next/router";
import ErrorPage from "next/error";
import { GetStaticPaths, GetStaticProps } from "next";
import { Loader2, Timer } from "lucide-react";
import readingTime from "reading-time";
import React, { useEffect, useState } from "react";
import { FacebookProvider } from "react-facebook";
import he from "he";
import striptags from "striptags";
import dynamic from "next/dynamic";

import Container from "../../components/container";
import PostBody from "../../components/post-body";
import PostHeader from "../../components/post-header";
import Layout from "../../components/layout";
import {
  getAllPostsWithSlug,
  getCategorieDetails,
  getCategorySlugs,
  getPostAndMorePosts,
  getPostList,
} from "../../lib/api";
import { URL_ARTICLE } from "../../lib/constants";
import Avatar from "../../components/avatar";
import Date from "../../components/date";
import MoreCategorie from "../../components/more-categorie";
import { useUser } from "@supabase/auth-helpers-react";

import { createClient } from "@supabase/supabase-js";
import { Database } from "../../types_db";
import AdBanner from "../../components/ab-banner";
import { Meta } from "../../components/meta";

export const revalidate = 3600;

const postBody = dynamic(() => import("../../components/post-body"), {
  ssr: false,
});

const SocialShareButtons = dynamic(
  () => import("../../components/social-share-buttons"),
  {
    ssr: false,
  }
);

const FacebookComment = dynamic(
  () => import("../../components/facebook-comment"),
  {
    ssr: false,
  }
);

const RelatedPosts = dynamic(() => import("../../components/related-posts"), {
  ssr: false,
});

type Article = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  categories: { nodes: { slug: string }[] };
};

interface Post {
  title: string;
  content: string;
  slug: string;
  excerpt: string;
  tags: string;
  date: string;
  author: string;
  featuredImage: {
    url: string;
    alt: string;
  } | null;
  categories: Array<{
    name: string;
    slug: string;
  }>;
}

type PostListResponse =
  | Article[]
  | { nodes: Article[]; endCursor: string | null };

const Post = ({ post, preview = true, relatedPosts }) => {
  const router = useRouter();
  const [article, setArticle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [statusMobileAbonne, setStatusMobileAbonne] = useState<
    string | undefined | null
  >(null);
  const [statusAbonne, setStatusAbonne] = useState<string | undefined | null>(
    null
  );
  const url = `https://www.afrikipresse.fr/article/${post?.slug}` || "";
  const statRead = readingTime(article);

  useEffect(() => {
    if (post?.content) {
      setArticle(post.content);
      setIsLoading(false);
    }
    setIsLoading(true);
  }, [post]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const user = useUser();
  const userId = user?.id;

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("mobilepayment")
          .select("statut_abonnement")
          .eq("user_foreign_key", user.id);

        if (error) {
          console.error(
            "Erreur lors de la récupération du statut d'abonnement:",
            error.message
          );
          return;
        }

        setStatusMobileAbonne((data as any)[0]?.statut_abonnement as string);
        console.log(
          "Fetch mobile payment data:",
          (data as any)[0]?.statut_abonnement as string
        );
      }
    };

    fetchSubscriptionStatus();
  }, [user, supabase]);

  useEffect(() => {
    const preventCopyPaste = (e: any) => {
      e.preventDefault();
    };

    document.documentElement.addEventListener("cut", preventCopyPaste);
    document.documentElement.addEventListener("copy", preventCopyPaste);
    document.documentElement.addEventListener("paste", preventCopyPaste);
    document.documentElement.addEventListener("contextmenu", preventCopyPaste);
    return () => {
      document.documentElement.removeEventListener("cut", preventCopyPaste);
      document.documentElement.removeEventListener("copy", preventCopyPaste);
      document.documentElement.removeEventListener("paste", preventCopyPaste);
      document.documentElement.addEventListener(
        "contextmenu",
        preventCopyPaste
      );
    };
  }, []);

  useEffect(() => {
    async function checkSubscriptionStatut(userId: any) {
      if (!userId) {
        console.error("ID utilisateur non défini");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Erreur lors de la récupération de l'utilisateur", error);
        return;
      }

      if (!data) {
        console.error("Utilisateur non abonné");
        return;
      }

      const { data: subscriptionData, error: subscriptionError } =
        await supabase
          .from("subscriptions")
          .select("status")
          .eq("user_id", userId)
          .single();

      if (subscriptionError) {
        console.error(
          "Erreur lors de la récupération du statut de la souscription stripe:",
          subscriptionError
        );
        return;
      }

      if (subscriptionData) {
        const subscriptionStatus = subscriptionData.status;
        console.log(`L'abonnement de l'utilisateur est: ${subscriptionStatus}`);
        setStatusAbonne(subscriptionStatus);
      } else {
        console.log(`L'utilisateur n'a pas d'abonnement actif.`);
        setStatusAbonne("Pas d'abonnement actif");
      }
    }

    checkSubscriptionStatut(userId);
  }, [userId, supabase]);

  if (router.isFallback) {
    return (
      <div className="flex justify-center items-center h-screen w-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        Chargement...
      </div>
    );
  }

  const ogUrl = URL_ARTICLE + post?.slug;
  const urlImage = post.featuredImage?.url;

  //console.log("INFO AUTEUR", post.author);

  const postTags: Array<{ node: { name: string } }> = post.tags.map(
    ({ node }) => node
  );

  const postExcerpt = he.decode(striptags(post.excerpt.slice(0, 200)));
  const publishedTime = post.date;
  const postTitle = post.title;
  const articleAuthor =
    post.author?.node?.firstName && post.author?.node?.lastName;
  const articleSection = post.category;
  const articleCat = post.categories[0]?.name || "";

  const datePublication = publishedTime.slice(0, 10);

  const toReplace = "https://afrikipresse.fr";
  const newAdress = "https://www.afrikipresse.fr/article";

  return (
    <>
      <Meta
        postTitle={postTitle}
        ogImage={urlImage}
        postExcerptDecoded={postExcerpt}
        postTags={postTags}
        ogUrl={ogUrl}
        publishedTime={publishedTime}
        articleAuthor={articleAuthor}
        articleSection={articleCat}
      />
      <Layout preview={preview} user={userId}>
        <Container>
          <article>
            <div className="grid grid-cols-1 lg:flex">
              <div className="lg:max-w-[1200px]">
                <div>
                  <div className="lg:mx-10">
                    <PostHeader
                      title={post.title}
                      coverImage={
                        post.featuredImage?.url ||
                        "https://www.afrikipresse.fr/default.png"
                      }
                      date={post.date}
                      author={post.author}
                      categories={post.categories}
                    />
                  </div>
                  <div className="flex lg:space-x-2">
                    <div className="flex md:block md:mb-6 ">
                      <div className="flex items-center lg:space-x-2 text-xs lg:text-[14px]">
                        <div>Publié le</div>
                        <Date dateString={post.date} /> <div>•</div>{" "}
                        <div>Par</div>
                        <Avatar author={post.author} />
                        <div>•</div>
                        <div className="hidden lg:flex">
                          <div className="flex items-center">
                            <Timer className="w-4 h-4 mr-1" />{" "}
                            <span>
                              {Math.round(statRead.minutes)} min de lecture
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="lg:hidden text-xs">
                    <div className="flex pt-3">
                      <div>
                        <Timer className="w-4 h-4 mr-1" />{" "}
                      </div>
                      <div>{Math.round(statRead.minutes)} min de lecture</div>
                    </div>
                  </div>
                  <div className="flex lg:space-x-2 pt-5 lg:pt-2">
                    <SocialShareButtons url={url} title={post.title} />
                  </div>

                  <div>
                    {
                      <div className="grid grid-cols-1 lg:flex">
                        <div>
                          {isClient && article && (
                            <div className="mt-10">
                              <PostBody content={article} />
                            </div>
                          )}

                          <div className="pt-10">
                            Réagir à l&apos;article
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
                        <div className="w-full lg:min-w-[300px] bg-slate-100/50 p-4">
                          <h2 className="mb-8 text-base md:text-2xl font-bold tracking-tighter leading-tight">
                            Publiés récemment
                          </h2>

                          {relatedPosts.length > 0 && (
                            <MoreCategorie posts={relatedPosts} />
                          )}
                        </div>
                      </div>
                    }
                  </div>
                  <div>
                    <AdBanner
                      data-ad-slot="2499770324"
                      data-ad-format="auto"
                      data-full-width-responsive="true"
                    />
                  </div>
                </div>
              </div>
            </div>
          </article>
        </Container>
      </Layout>
    </>
  );
};

export default Post;

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
}) => {
  if (!params?.slug) {
    return {
      notFound: true,
    };
  }

  try {
    const data = await getPostAndMorePosts(
      params?.slug as string,
      preview,
      null
    );

    //console.log("DATA POST TAGS AND MORE POSTS", data.post);
    //console.log("AUTHOR DATA", data.post.author.node?.name);

    const post: Post = {
      content: data.post.content || "",
      excerpt: data.post.excerpt || "",
      title: data.post.title || "",
      slug: data.post.slug || "",
      date: data.post.date || "",
      author: data.post.author.node?.name || "",
      tags: data.post.tags.edges || "",
      featuredImage: data.post.featuredImage
        ? {
            url: data.post.featuredImage.node?.sourceUrl || "",
            alt: data.post.featuredImage.node?.altText || "",
          }
        : null,
      categories:
        data.post.categories?.edges?.map((edge) => ({
          name: edge.node.name || "",
          slug: edge.node.slug || "",
        })) || [],
    };

    //console.log("SLUG SLUG", data.post.slug);

    if (!post.slug) {
      console.log("Post is missing", post);
      return { notFound: true };
    }

    return {
      props: {
        preview: preview || false,
        post,
        posts: data.posts || null,
        relatedPosts: data.posts?.edges || [],
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.log("Error fetching posts:", error);
    return { notFound: true };
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const allPosts = await getAllPostsWithSlug();

    return {
      paths: allPosts.edges?.map(({ node }) => `/article/${node.slug}`) || [],
      fallback: true,
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return {
      paths: [],
      fallback: false,
    };
  }
};
