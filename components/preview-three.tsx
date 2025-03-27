import Avatar from "./avatar";
import Date from "./date";
import CoverImage from "./cover-image";
import Link from "next/link";

export default function PreviewThree({ title, coverImage, slug }) {
  return (
    <div className="flex border-b-[1px]">
      <div className="hidden lg:flex mb-5 w-96 object-cover lg:mx-4">
        {coverImage && (
          <CoverImage title={title} coverImage={coverImage} slug={slug} />
        )}
      </div>

      <h3 className="text-md font-bold mb-3 leading-snug">
        <Link
          href={`/article/${slug}`}
          className="hover:underline"
          dangerouslySetInnerHTML={{ __html: title }}
        ></Link>
      </h3>
      <div className="lg:hidden w-96 mb-4 md:mb-16">
        {coverImage && (
          <CoverImage title={title} coverImage={coverImage} slug={slug} />
        )}
      </div>
    </div>
  );
}
