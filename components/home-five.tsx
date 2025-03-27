import React from "react";
import PreviewFive from "./preview-five";

export default function HomeFive({ posts }) {
  return (
    <div className="lg:grid lg:grid-cols-2 lg:mx-4">
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
