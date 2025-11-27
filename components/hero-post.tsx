import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { User, ArrowRight, Clock, Calendar } from "lucide-react";
import Date from "./date";

interface Post {
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

interface Props {
  posts: Post[]; // Accepte maintenant un tableau de posts
}

export default function HeroPost({ posts }: Props) {
  // Prendre les 4 derniers articles
  const latestPosts = posts.slice(0, 4);
  const mainPost = latestPosts[0]; // Le tout dernier (colonne gauche)
  const sidePosts = latestPosts.slice(1, 4); // Les 3 suivants (colonne droite)

  // Calculer le temps de lecture
  const calculateReadingTime = (excerpt: string) => {
    const stripHtml = excerpt.replace(/<[^>]+>/g, "");
    const words = stripHtml.split(/\s+/).length;
    return Math.ceil(words / 200);
  };

  if (!mainPost) return null;

  return (
    <section className="relative mb-12 w-full max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLONNE GAUCHE - Article principal (2/3 de la largeur) */}
        <article className="lg:col-span-2 group">
          <Link href={`/article/${mainPost.slug}`} className="block space-y-4">
            {/* Image principale */}
            <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden rounded-2xl shadow-2xl">
              {mainPost.coverImage && (
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                  <Image
                    src={mainPost.coverImage.node.sourceUrl}
                    alt={mainPost.title || "Image de l'article"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 66vw"
                    priority
                  />
                  {/* Overlay subtil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              )}

              {/* Badge "À la Une" */}
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                  À la Une
                </span>
              </div>
            </div>

            {/* Contenu textuel séparé */}
            <div className="space-y-3 px-2">
              {/* Titre */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-tight line-clamp-3 group-hover:text-red-600 transition-colors duration-300">
                <span dangerouslySetInnerHTML={{ __html: mainPost.title }} />
              </h1>

              {/* Extrait */}
              <div
                className="text-base md:text-lg text-gray-600 leading-relaxed line-clamp-2"
                dangerouslySetInnerHTML={{ __html: mainPost.excerpt }}
              />

              {/* Meta informations */}
              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {mainPost.author?.node?.name || "Afrikipresse"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <Date dateString={mainPost.date} />
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{calculateReadingTime(mainPost.excerpt)} min</span>
                </div>

                <div className="ml-auto">
                  <span className="inline-flex items-center gap-2 text-red-600 font-semibold group-hover:gap-3 transition-all">
                    Lire l'article <ArrowRight className="w-5 h-5" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </article>

        {/* COLONNE DROITE - 3 articles secondaires (1/3 de la largeur) */}
        <aside className="space-y-6">
          {sidePosts.map((post, index) => (
            <article key={post.slug} className="group">
              <Link href={`/article/${post.slug}`} className="block space-y-3">
                {/* Image secondaire */}
                <div className="relative h-[180px] w-full overflow-hidden rounded-xl shadow-lg">
                  {post.coverImage && (
                    <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110">
                      <Image
                        src={post.coverImage.node.sourceUrl}
                        alt={post.title || "Image de l'article"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  )}
                </div>

                {/* Contenu textuel séparé */}
                <div className="space-y-2 px-1">
                  {/* Titre */}
                  <h3 className="text-base md:text-lg font-bold text-gray-900 leading-snug line-clamp-3 group-hover:text-red-600 transition-colors duration-300">
                    <span dangerouslySetInnerHTML={{ __html: post.title }} />
                  </h3>

                  {/* Meta informations */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <Date dateString={post.date} />
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{calculateReadingTime(post.excerpt)} min</span>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </aside>
      </div>
    </section>
  );
}
