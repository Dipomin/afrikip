import React from "react";
import CoverImage from "./cover-image";
import PreviewThree from "./preview-three";

export default function HomeFour({ posts }) {
  return (
    <section>
      <div className="flex flex-col w-[420px] lg:w-full lg:grid lg:grid-cols-2 md:grid-cols-2 md:gap-x-16 lg:gap-x-4 gap-y-8 md:gap-y-8 mb-8 border-b-0">
        {posts.map(({ node }) => (
          <PreviewThree
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
