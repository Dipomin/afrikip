import Avatar from "./avatar";
import CoverImage from "./cover-image";
import PostTitle from "./post-title";
import Categories from "./categories";

export default function PostHeader({
  title,
  coverImage,
  date,
  author,
  categories,
}) {
  return (
    <>
      <div className="flex ">
        <div className="mb-6 text-lg">
          <Categories categories={categories} />
        </div>
      </div>

      <PostTitle>{title}</PostTitle>
      <div className="mb-8 md:mb-8 sm:mx-0">
        <CoverImage title={title} coverImage={coverImage} />
      </div>
      <div className=" mx-auto">
        <div className="hidden md:hidden mb-6">
          <Avatar author={author} />
        </div>
      </div>
    </>
  );
}
