import Link from "next/link";
import HomePolitiqueList from "./home-politique-list";

export default function PreviewCategorieHomeList({ posts }) {
  return (
    <div className="grid grid-cols-1 lg:flex ">
      <h3 className="text-[15px] font-bold mb-3 leading-snug">
        {posts.map(({ node }) => (
          <HomePolitiqueList
            key={node.slug}
            title={node.title}
            slug={node.slug}
          />
        ))}
      </h3>
    </div>
  );
}
