import Head from "next/head";
import { CMS_NAME, HOME_OG_IMAGE_URL } from "../lib/constants";

export function Meta({
  postExcerptDecoded,
  ogImage,
  postTitle,
  ogUrl,
  publishedTime,
  articleAuthor,
  articleSection,
  postTags,
}) {
  return (
    <Head>
      <title>{`${postTitle}`}</title>
      <meta name="title" content={postTitle} />
      <meta name="description" content={postExcerptDecoded} />
      <meta
        name="robots"
        content="max-snippet:-1 max-image-preview:large, noarchive"
      />
      <meta property="article:tag" content={postTags} />
      <meta property="og:site_name" content="Afrikipresse" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={postTitle} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:title" content={postTitle} />
      <meta property="og:description" content={postExcerptDecoded} />
      <meta property="og:type" content="article" />
      <meta property="og:locale" content="fr_FR" />
      <meta property="twitter:image" content={ogImage} />
      <meta property="twitter:description" content={postExcerptDecoded} />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={postTitle} />
      <meta property="article:published_time" content={publishedTime} />
      <meta property="article:author" content={articleAuthor} />
      <meta property="article:section" content={articleSection} />
      <meta property="fb:app_id" content="692268107519885" />
    </Head>
  );
}
