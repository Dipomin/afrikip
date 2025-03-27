import React from "react";
import { CMS_NAME } from "../lib/constants";

const MetaSeo = ({ post }) => {
  const postAuthor = post?.author?.node?.name || "";
  const postTags = post?.tags?.edges || "";
  const postImage = post?.featuredImage?.node?.sourceUrl || "";
  const postExcerpt = post?.excerpt || "";
  const postExcerptDecoded =
    typeof window !== "undefined"
      ? new DOMParser().parseFromString(postExcerpt, "text/html").body
          .textContent || ""
      : "";

  const categorieArticle = post?.categories?.edges[0]?.node?.name || "";

  console.log("Author:", postAuthor);
  console.log("Post:", post);

  return (
    <div>
      <title>{`${post?.title} | ${CMS_NAME}`}</title>
      <meta property="og:image" content={postImage} />
      <meta property="og:image:alt" content={post?.title} />
      <meta property="og:title" content={post?.title} />
      <meta property="twitter:description" content={postExcerptDecoded} />
      <meta property="description" content={postExcerptDecoded} />
      <meta property="og:description" content={postExcerptDecoded} />
      <meta
        property="twitter:url"
        content={`https://www.afrikipresse.com/article/${post?.slug}`}
      />
      <meta property="article:published_time" content={post?.date} />
      <meta property="article:author" content={postAuthor} />
      <meta property="article:tag" content={postTags} />
      <meta property="article:section" content={categorieArticle} />
      <meta name="description" content={postExcerptDecoded} />
      <link
        rel="canonical"
        href={`https://www.afrikipresse.com/article/${post?.slug}`}
      />
      <meta
        property="og:url"
        content={`https://www.afrikipresse.com/article/${post?.slug}`}
      />
    </div>
  );
};

export default MetaSeo;
