import React from "react";
import PreviewFive from "./preview-five";

export default function HomeFive({ posts }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-4">
      {posts.map(({ node }) => (
        <PreviewFive
          key={node.slug}
          title={node.title}
          coverImage={node.featuredImage}
          slug={node.slug}
          excerpt={node.excerpt}
        />
      ))}
    </div>
  );
}
