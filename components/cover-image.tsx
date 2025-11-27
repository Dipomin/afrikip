import cn from "classnames";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Props {
  title: string;
  coverImage:
    | {
        node: {
          sourceUrl: string;
        };
      }
    | string;
  slug?: string;
}

export default function CoverImage({ title, coverImage, slug }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const imageUrl =
    typeof coverImage === "string" ? coverImage : coverImage?.node?.sourceUrl;

  const fallbackImage = "https://www.afrikipresse.fr/default.png";
  const imageSrc = imageUrl || fallbackImage;

  if (!mounted) {
    return null; // ou un placeholder
  }

  const image = (
    <img
      src={imageSrc}
      alt={title || ""}
      width={1500}
      height={800}
      className={cn("shadow-small", {
        "hover:shadow-medium transition-shadow duration-200 rounded-sm": slug,
      })}
    />

    /**
     * 
    <Image
      width={1500}
      height={800}
      alt={title || ""}
      src={imageSrc}
      className={cn("shadow-small", {
        "hover:shadow-medium transition-shadow duration-200 rounded-sm": slug,
      })}
      priority={true}
    />
     */
  );

  return (
    <div className="sm:mx-0">
      {slug ? (
        <Link href={`/article/${slug}`} aria-label={title}>
          {image}
        </Link>
      ) : (
        image
      )}
    </div>
  );
}
