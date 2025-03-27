import Avatar from "./avatar";
import Date from "./date";
import CoverImage from "./cover-image";
import Link from "next/link";

export default function PreviewMiniDisplay({ title, coverImage, slug }) {
  return (
    <div className="flex flex-col mx-4 mb-5">
      <div className="mb-5 object-cover ">
        {coverImage && (
          <CoverImage title={title} coverImage={coverImage} slug={slug} />
        )}
      </div>
      <h3 className="text-[12px] font-semibold leading-snug">
        <Link
          href={`/article/${slug}`}
          className="hover:underline"
          dangerouslySetInnerHTML={{ __html: title }}
        ></Link>
      </h3>
    </div>
  );
}
