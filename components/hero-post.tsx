import CoverImage from "./cover-image";
import Link from "next/link";
import TimeAgo from "javascript-time-ago";
import fr from "javascript-time-ago/locale/fr";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ weight: "700", subsets: ["latin"] });

export default function HeroPost({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
}) {
  TimeAgo.addLocale(fr);

  return (
    <section>
      <div className="lg:flex border-b-[1px]">
        <div className="md:grid md:grid-cols-1 md:gap-x-16 lg:gap-x-8 mb-10 md:mb-8 p-4">
          <div>
            <h2 className="mb-4 font-serif font-black text-2xl lg:text-4xl md:text-4xl leading-tight">
              <Link
                href={`/article/${slug}`}
                className="hover:underline"
                dangerouslySetInnerHTML={{ __html: title }}
              ></Link>
            </h2>
          </div>
          <div className="block lg:hidden mb-4 md:mb-16">
            {coverImage && (
              <CoverImage title={title} coverImage={coverImage} slug={slug} />
            )}
          </div>
          <div>
            <div
              className="text-lg lg:text-lg md:text-lg leading-tight mb-4 mr-6"
              dangerouslySetInnerHTML={{ __html: excerpt }}
            />
          </div>
        </div>
        <div className="hidden lg:block mb-4 md:mb-16">
          {coverImage && (
            <CoverImage title={title} coverImage={coverImage} slug={slug} />
          )}
        </div>
      </div>
    </section>
  );
}
