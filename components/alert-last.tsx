import React from "react";
import AlertTitle from "./alerte-title";

export default function AlertLast({ posts }) {
  return (
    <section>
      <div className="hidden lg:flex md:flex bg-black w-full">
        {posts.map(({ node }) => (
          <AlertTitle key={node.slug} title={node.title} slug={node.slug} />
        ))}
      </div>
    </section>
  );
}
