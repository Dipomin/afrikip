import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function FeaturedImages({ post }) {
  let imagePost: any;

  const defaultFeaturedImage = "";
  const defaultWidth = "400";
  const defaultHeight = "300";

  if (post.featuredImage) {
    let size = post.featuredImage.node.mediaDetails.sizes[0];
    imagePost = {
      src: size.sourceUrl,
      width: size.width,
      height: size.height,
    };
  } else {
    imagePost = {
      src: defaultFeaturedImage,
      width: defaultWidth,
      height: defaultHeight,
    };
  }

  return (
    <div>
      <Link href={`/article/${post.slug}`}>
        <Image
          src={imagePost.src}
          width={imagePost.width}
          height={imagePost.height}
          alt={post.title}
          className="w-44 lg:h-full lg:w-80 md:w-80 object-cover rounded-sm"
        />
      </Link>
    </div>
  );
}
