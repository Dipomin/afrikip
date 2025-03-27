import React from "react";
import CoverImage from "./cover-image";
import PreviewThree from "./preview-three";
import PreviewCategorieHomeList from "./preview-categorie-home";
import PreviewOneList from "./preview-one-list";
import InterPreview from "./inter-preview";

export default function HomeInterPreview({ posts }) {
  return (
    <section>
      <div className="flex flex-col lg:grid lg:grid-cols-4 space-x-0">
        {posts.map(({ node }) => (
          <InterPreview
            key={node.slug}
            title={node.title}
            coverImage={node.featuredImage}
            excerpt={node.excerpt}
            slug={node.slug}
          />
        ))}
      </div>
    </section>
  );
}
