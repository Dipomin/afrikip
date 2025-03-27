export const filterPostsByCategory = (edges: any[], category: string) => {
  return edges.filter((edge) =>
    edge.node.categories.edges.some(
      (cat) => cat.node.slug === category
    )
  );
};

export const slicePosts = (posts: any[], start: number, end: number) => {
  return posts.slice(start, end);
};