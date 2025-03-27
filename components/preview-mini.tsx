import PreviewMiniDisplay from "./preview-mini-display";

export default function PreviewMini({ posts }) {
  return (
    <section>
      <div className="flex bg-slate-100 p-6">
        {posts.map(({ node }) => (
          <PreviewMiniDisplay
            key={node.slug}
            title={node.title}
            coverImage={node.featuredImage}
            slug={node.slug}
          />
        ))}
      </div>
    </section>
  );
}
