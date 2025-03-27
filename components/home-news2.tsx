import React from "react";
import PreviewThree from "./preview-three";
import Link from "next/link";
import CoverImage from "./cover-image";

export default function HomeNews2({ title, coverImage, excerpt, slug }) {
  return (
    <section>
      <div className="flex lg:flex lg:flex-col lg:border-b-0 border-b-[1px] lg:p-4 lg:max-w-[600px]">
        <div className="md:grid md:grid-cols-1 md:gap-x-16 lg:gap-x-8 mb-4 md:mb-8 ">
          <div className="line-clamp-3">
            <h3 className="font-serif line-clamp-3 font-black text-md lg:text-xl leading-tight ">
              <Link
                href={`/article/${slug}`}
                className="hover:underline"
                dangerouslySetInnerHTML={{ __html: title }}
              />
            </h3>
          </div>
        </div>
        <div className="flex justify-center w-96 mb-2 md:mb-4">
          {coverImage && (
            <CoverImage title={title} coverImage={coverImage} slug={slug} />
          )}
        </div>
        <div className="line-clamp-4">
          {excerpt && (
            <div
              className="hidden lg:block lg:text-lg leading-relaxed mb-4 "
              dangerouslySetInnerHTML={{ __html: excerpt }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
