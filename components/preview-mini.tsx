import PreviewMiniDisplay from "./preview-mini-display";

export default function PreviewMini({ posts }) {
  return (
    <section>
      <div className="flex bg-slate-100 p-6">
        {posts.map(({ node }) => (
          <PreviewMiniDisplay
            key={node.slug}
            title={node.title}
            coverImage={
              node.featuredImage || {
                node: {
                  sourceUrl: "https://www.afrikipresse.fr/default.png",
                  mediaDetails: {
                    width: 1500,
                    height: 800,
                  },
                },
              }
            }
            slug={node.slug}
          />
        ))}
      </div>
    </section>
  );
}
