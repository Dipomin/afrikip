import PostPreview from "./post-preview";
import RelatedPostPreview from "./related-post-preview";

interface MoreCategorieProps {
  posts: Array<{
    node?: {
      slug: string;
      title?: string;
      featuredImage: string;
      excerpt?: string;
    };
  }>;
}

export default function RelatedPosts({ posts }: MoreCategorieProps) {
  return (
    <section>
      <div className="lg:flex md:grid-cols-2 lg:grid-cols-1 md:gap-x-8 lg:gap-x-8 gap-y-10 md:gap-y-16 mb-16">
        {posts.map(({ node }) => (
          <RelatedPostPreview
            key={node?.slug ?? ""}
            title={node?.title ?? ""}
            coverImage={node?.featuredImage ?? ""}
            slug={node?.slug ?? ""}
            excerpt={node?.excerpt ?? ""}
          />
        ))}
      </div>
    </section>
  );
}
