import React from "react";
import Link from "next/link";
import CoverImage from "./cover-image";
import { Card } from "./ui/card";
import { cn } from "../lib/utils";

interface HomeNews2Props {
  title: string;
  coverImage: {
    node: {
      sourceUrl: string;
    };
  };
  excerpt?: string;
  slug: string;
}

export default function HomeNews2({
  title,
  coverImage,
  excerpt,
  slug,
}: HomeNews2Props) {
  return (
    <Card className="group hover:shadow-lg border-none bg-background/50 backdrop-blur-sm">
      <Link href={`/article/${slug}`} className="flex flex-col p-2">
        {/* Image en haut */}
        <div className="relative h-64 w-full overflow-hidden">
          {coverImage && (
            <div className="h-full w-full transform transition-transform duration-500 group-hover:scale-105">
              <CoverImage title={title} coverImage={coverImage} slug={slug} />
            </div>
          )}
        </div>

        {/* Contenu en bas */}
        <div className="flex flex-col p-4">
          {/* Titre */}
          <h3
            className={cn(
              "font-serif font-bold text-xl mb-2",
              "group-hover:text-primary transition-colors duration-200"
            )}
            dangerouslySetInnerHTML={{ __html: title }}
          />

          {/* Extrait */}
          {excerpt && (
            <div
              className="text-muted-foreground text-sm mb-3 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: excerpt }}
            />
          )}

          {/* Lire la suite */}
          <div className="border-t border-muted/20 pt-2">
            <span className="text-primary text-sm font-medium inline-flex items-center">
              Lire l'article
              <svg
                className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
