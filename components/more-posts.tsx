import { useState } from "react";
import { getAllPosts } from "../lib/api";
import { GetStaticProps } from "next";

const PostsList = ({ initialPosts }) => {
  const [poster, setPosts] = useState(initialPosts || []); // Initialize with initialPosts or an empty array
  const [currentPage, setCurrentPage] = useState(1);

  console.log("Initial Posts", initialPosts);

  const fetchNextPage = async () => {
    const nextPage = currentPage + 1;
    const newPosts = await getAllPosts(
      false,
      50,
      poster[poster.length - 1]?.date
    );

    if (newPosts) {
      setPosts([...poster, ...newPosts]);
      setCurrentPage(nextPage);
    }

    if (newPosts && newPosts.length > 0) {
      console.log("Fetched posts:", poster);
    }
  };

  // Corrected console.log statement
  console.log("Fetched posts:", poster);

  return (
    <div>
      <ul>
        {poster && poster.length > 0 ? (
          poster.map((post) => (
            <li key={post.node.slug}>
              {/* Render post details */}
              <p>{post.node.title}</p>
            </li>
          ))
        ) : (
          <li>No posts available</li>
        )}
      </ul>

      <button onClick={fetchNextPage} disabled={!poster || !poster.length}>
        Load More
      </button>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async (preview) => {
  const data = await getAllPosts(preview);

  console.log("Data", data);

  return {
    props: {
      initialPosts: data.posts || [], // Use initialPosts instead of posts
    },
  };
};

export default PostsList;
