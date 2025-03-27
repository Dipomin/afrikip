import PostPreview from "./post-preview";

export default function MoreStories({ posts }) {
  return (
    <section>
      <h2 className="mb-8 text-2xl md:text-3xl font-bold tracking-tighter leading-tight">
        Lire aussi
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8 lg:gap-x-16 gap-y-20 md:gap-y-16 mb-16">
        {posts.map(({ node }) => (
          <PostPreview
            key={node.slug}
            title={node.title}
            coverImage={node.featuredImage}
            date={node.date}
            author={node.author}
            slug={node.slug}
            excerpt={node.excerpt}
            tags={node.tags}
          />
        ))}
      </div>
    </section>
  );
}
