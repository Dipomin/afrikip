import React from "react";
import PreviewThree from "./preview-three";
import Link from "next/link";

export default function HomePolitiqueList({ title, slug }) {
  return (
    <div>
      <div>
        <h3 className="text-md lg:text-md font-serif font-bold py-5 leading-snug border-b-[1px]">
          <Link
            href={`/article/${slug}`}
            className="hover:underline"
            dangerouslySetInnerHTML={{ __html: title }}
          ></Link>
        </h3>
      </div>
    </div>
  );
}
