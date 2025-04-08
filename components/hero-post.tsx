import Link from "next/link";
import CoverImage from "./cover-image";
import Date from "./date";
import { Calendar, Timer } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  title: string;
  coverImage: {
    node: {
      sourceUrl: string;
      mediaDetails?: {
        width?: number;
        height?: number;
      };
    };
  } | null;
  date: string;
  excerpt: string;
  author: {
    node: {
      name: string;
    };
  };
  slug: string;
}

export default function HeroPost({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
}: Props) {
  const [readingTime, setReadingTime] = useState<number>(0);

  useEffect(() => {
    if (excerpt) {
      const stripHtml = excerpt.replace(/<[^>]+>/g, "");
      const words = stripHtml.split(/\s+/).length;
      const time = Math.ceil(words / 200);
      setReadingTime(time);
    }
  }, [excerpt]);

  // Définir une image par défaut
  const defaultImage = {
    node: {
      sourceUrl: "https://www.afrikipresse.fr/default.png",
      mediaDetails: {
        width: 1500,
        height: 800,
      },
    },
  };

  // Utiliser l'image fournie ou l'image par défaut
  const imageToUse = coverImage || defaultImage;

  return (
    <section className="relative overflow-hidden transition-all duration-300 hover:shadow-lg rounded-lg mb-8">
      <div className="flex lg:flex border-b-[1px] bg-white">
        <div className="md:gap-x-16 lg:gap-x-8 mb-20 md:mb-28">
          <h3 className="mb-4 font-serif font-black text-2xl lg:text-4xl md:text-4xl leading-tight transition-colors duration-200 hover:text-red-700">
            <Link
              href={`/article/${slug}`}
              className="hover:underline"
              dangerouslySetInnerHTML={{ __html: title }}
            />
          </h3>
          <small className="flex mb-4 md:mb-0 py-5 mx-4">
            <div className="flex">
              <Calendar className="h-4 w-4" /> <Date dateString={date} />
            </div>
            <div>
              {readingTime > 0 && (
                <div className="flex items-center">
                  <Timer className="h-4 w-4 ml-3" />
                  <span>{readingTime} min de lecture</span>
                </div>
              )}
            </div>
          </small>
          <div>
            <div
              className="text-lg leading-relaxed mb-4"
              dangerouslySetInnerHTML={{ __html: excerpt }}
            />
            <p className="text-lg font-bold">
              Par {author?.node?.name || "Afrikipresse"}
            </p>
          </div>
        </div>
        <div className="mb-8 md:mb-16">
          <CoverImage
            title={title}
            coverImage={imageToUse.node.sourceUrl}
            slug={slug}
          />
        </div>
      </div>
    </section>
  );
}
