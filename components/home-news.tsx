import React from "react";
import Link from "next/link";
import CoverImage from "./cover-image";

export default function HomeNews({ title, slug, excerpt, coverImage }) {
  return (
    <section>
      <div className="flex lg:flex lg:flex-col lg:border-b-0 border-b-[1px]">
        <div className="md:grid md:grid-cols-1 md:gap-x-16 lg:gap-x-8 mb-4 md:mb-8 ">
          <div>
            <h3 className="font-serif font-black text-md lg:text-xl leading-tight">
              <Link
                href={`/article/${slug}`}
                className="hover:underline"
                dangerouslySetInnerHTML={{ __html: title }}
              ></Link>
            </h3>
          </div>
        </div>
        <div className="w-96 mb-2 md:mb-4">
          {coverImage && (
            <CoverImage title={title} coverImage={coverImage} slug={slug} />
          )}
        </div>
      </div>
    </section>
  );
}
