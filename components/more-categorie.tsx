import Image from "next/image";
import PostPreview from "./post-preview";

interface MoreCategorieProps {
  posts: Array<{
    node?: {
      slug: string;
      title?: string;
      featuredImage: string;
      date?: string;
      author?: string;
      excerpt?: string;
      tags?: string;
    };
  }>;
}

export default function MoreCategorie({ posts }: MoreCategorieProps) {
  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:gap-x-8 lg:gap-x-8 gap-y-5 md:gap-y-8 mb-8">
        {posts.map(({ node }) => (
          <PostPreview
            key={node?.slug ?? ""}
            title={node?.title ?? ""}
            coverImage={node?.featuredImage ?? ""}
            date={node?.date ?? "00:00"}
            author={node?.author ?? ""}
            slug={node?.slug ?? "/"}
            excerpt={node?.excerpt ?? ""}
            tags={node?.tags ?? ""}
          />
        ))}
      </div>
    </section>
  );
}
