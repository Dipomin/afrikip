import React from "react";
import CoverImage from "./cover-image";
import Link from "next/link";
import { Card } from "./ui/card";
import { cn } from "../lib/utils";

interface PreviewFiveProps {
  title: string;
  coverImage: {
    node: {
      sourceUrl: string;
    };
  };
  excerpt?: string;
  slug: string;
}

export default function PreviewFive({
  title,
  coverImage,
  excerpt,
  slug,
}: PreviewFiveProps) {
  return (
    <Card className="group hover:shadow-lg border-none bg-background/50 backdrop-blur-sm">
      <Link href={`/article/${slug}`} className="flex flex-col p-4">
        {/* Image en haut */}
        <div className="relative h-64 w-full overflow-hidden">
          {coverImage && (
            <div className="h-full w-full transform transition-transform duration-500 group-hover:scale-105">
              <CoverImage title={title} coverImage={coverImage} slug={slug} />
            </div>
          )}
        </div>

        {/* Contenu en bas */}
        <div className="flex flex-col">
          {/* Titre */}
          <h3
            className={cn(
              "font-serif font-bold text-xl mb-2",
              "group-hover:text-primary transition-colors duration-200 line-clamp-2"
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
        </div>
      </Link>
    </Card>
  );
}
