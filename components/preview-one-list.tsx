import Avatar from "./avatar";
import Date from "./date";
import CoverImage from "./cover-image";
import Link from "next/link";

export default function PreviewOneList({ title, coverImage, slug }) {
  return (
    <div className="flex flex-col border-b-[1px] lg:border-b-0 lg:w-[500px] lg:mx-6 mb-5">
      <div className="mb-5 object-cover ">
        {coverImage && (
          <CoverImage title={title} coverImage={coverImage} slug={slug} />
        )}
      </div>
      <h3 className="text-xl font-serif font-bold leading-snug">
        <Link
          href={`/article/${slug}`}
          className="hover:underline"
          dangerouslySetInnerHTML={{ __html: title }}
        ></Link>
      </h3>
    </div>
  );
}
