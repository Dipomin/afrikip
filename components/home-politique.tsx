import React from "react";
import CoverImage from "./cover-image";
import PreviewThree from "./preview-three";
import PreviewCategorieHomeList from "./preview-categorie-home";
import PreviewOneList from "./preview-one-list";

export default function HomePolitique({ posts }) {
  return (
    <section>
      <div>
        {posts.map(({ node }) => (
          <PreviewOneList
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
