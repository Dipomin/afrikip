import CoverImage from "./cover-image";
import Link from "next/link";

export default function InterPreview({ title, coverImage, slug, excerpt }) {
  return (
    <div className="flex flex-col bg-black pt-5 border-b-[1px] border-b-white">
      <div className=" p-4 mx-2">
        {coverImage && (
          <CoverImage title={title} coverImage={coverImage} slug={slug} />
        )}
      </div>
      <div className="text-md lg:text-lg md:text-lg text-white font-serif font-bold p-4 leading-snug">
        <Link
          href={`/article/${slug}`}
          className="hover:underline"
          dangerouslySetInnerHTML={{ __html: title }}
        ></Link>
      </div>
      <div className="text-[12px] text-white p-4 font-medium mb-3 leading-snug">
        <Link
          href={`/article/${slug}`}
          className="hover:underline"
          dangerouslySetInnerHTML={{ __html: excerpt }}
        ></Link>
      </div>
    </div>
  );
}
