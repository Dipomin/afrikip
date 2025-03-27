import Link from "next/link";

export default function Tags({ tags }) {
  return (
    <div className="max-w-2xl mx-auto">
      <p className="mt-8 text-lg font-bold">
        Mots clés :
        {tags.edges.map((tag, index) => (
          <Link
            href={`/tag/${tag.node.name}`.replace(" ", "-").toLowerCase()}
            target="_blank"
            key={index}
            className="ml-4 font-normal"
          >
            {tag.node.name}
          </Link>
        ))}
      </p>
    </div>
  );
}
