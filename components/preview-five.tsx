import React from "react";
import CoverImage from "./cover-image";
import Link from "next/link";

export default function PreviewFive({ title, excerpt, slug, coverImage }) {
  return (
    <section>
      <div className="  lg:flex lg:flex-col lg:border-r-[1px] lg:px-5 px-0">
        <div className="md:grid md:grid-cols-1 md:gap-x-16 lg:gap-x-8 mb-10 md:mb-8 ">
          <div>
            <h3 className="mb-4 font-serif font-black text-2xl lg:text-2xl leading-tight line-clamp-3">
              <Link
                href={`/article/${slug}`}
                className="hover:underline"
                dangerouslySetInnerHTML={{ __html: title }}
              ></Link>
            </h3>
          </div>
          <div className="mb-4 md:mb-16 lg:w-96">
            {coverImage && (
              <CoverImage title={title} coverImage={coverImage} slug={slug} />
            )}
          </div>
          <div className="line-clamp-4">
            <div
              className="hidden lg:block lg:text-lg leading-relaxed mb-4"
              dangerouslySetInnerHTML={{ __html: excerpt }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
