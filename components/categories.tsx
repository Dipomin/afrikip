export default function Categories({ categories }) {
  return (
    <span className="ml-1 uppercase font-medium ">
      {categories.edges.length > 0 ? (
        categories.edges.map((category, index) => (
          <span
            key={index}
            className="ml-1 bg-red-600 pr-2 pl-2 pt-1 pb-1 text-white"
          >
            {category.node.name}
          </span>
        ))
      ) : (
        <span className="ml-1">{categories.edges.node.name}</span>
      )}
    </span>
  );
}
