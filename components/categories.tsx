export default function Categories({ categories }) {
  //console.log("CATEGORIES", categories[0].name);
  return (
    <span className="ml-1 uppercase font-medium ">
      {categories.length > 0 ? (
        <span className="ml-1 bg-red-600 pr-2 pl-2 pt-1 pb-1 text-white">
          {categories[0].name}
        </span>
      ) : (
        <span className="ml-1">{categories.edges.node.name}</span>
      )}
    </span>
  );
}
