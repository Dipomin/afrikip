import React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { Clock, User, Calendar, ArrowRight, Eye, BookOpen } from "lucide-react";
import CoverImage from "./cover-image";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

// Variants pour le composant HomeNews2
const homeNews2Variants = cva(
  "group relative overflow-hidden transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-primary/10",
  {
    variants: {
      variant: {
        default: "bg-card border border-border/50 hover:border-primary/20",
        featured:
          "bg-gradient-to-br from-primary/5 via-card to-secondary/5 border-2 border-primary/20 hover:border-primary/40",
        minimal:
          "bg-card/50 backdrop-blur-sm border border-border/30 hover:border-border/60",
        elevated: "bg-card shadow-lg border-0 hover:shadow-xl",
      },
      size: {
        sm: "max-w-sm",
        default: "max-w-md",
        lg: "max-w-lg",
        full: "w-full",
      },
      layout: {
        vertical: "flex-col",
        horizontal: "flex-row",
        compact: "flex-col space-y-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      layout: "vertical",
    },
  }
);

// Types pour les métadonnées
interface Author {
  name?: string;
  avatar?: string;
}

interface Category {
  name: string;
  slug: string;
  color?: string;
}

interface HomeNews2Props extends VariantProps<typeof homeNews2Variants> {
  title: string;
  coverImage: {
    node: {
      sourceUrl: string;
      mediaDetails?: {
        width?: number;
        height?: number;
      };
    };
  };
  excerpt?: string;
  slug: string;
  date?: string;
  author?: Author;
  category?: Category;
  readTime?: number;
  views?: number;
  featured?: boolean;
  className?: string;
}

// Fonction utilitaire pour sanitiser le HTML
const sanitizeHtml = (html: string): string => {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+="[^"]*"/gi, "");
};

// Fonction pour formater la date
const formatDate = (dateString?: string): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "À l'instant";
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return "Hier";

    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
};

// Fonction pour calculer le temps de lecture
const calculateReadTime = (
  text?: string,
  providedReadTime?: number
): number => {
  if (providedReadTime) return providedReadTime;
  if (!text) return 1;

  const wordsPerMinute = 200;
  const wordCount = text.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

/**
 * Composant HomeNews2 moderne et professionnel
 * Affiche un article avec image, métadonnées et interactions avancées
 */
export default function HomeNews2({
  title,
  coverImage,
  excerpt,
  slug,
  date,
  author,
  category,
  readTime,
  views,
  featured = false,
  variant = "default",
  size = "default",
  layout = "vertical",
  className,
}: HomeNews2Props) {
  const sanitizedTitle = sanitizeHtml(title);
  const sanitizedExcerpt = excerpt ? sanitizeHtml(excerpt) : "";
  const formattedDate = formatDate(date);
  const estimatedReadTime = calculateReadTime(excerpt, readTime);

  // Déterminer la variante basée sur les props
  const finalVariant = featured ? "featured" : variant;

  return (
    <Link
      href={`/article/${slug}`}
      className={cn(
        "group block bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-red-500/30 hover:shadow-xl transition-all duration-300",
        className
      )}
      role="article"
      aria-label={`Lire l'article: ${title}`}
    >
      {/* Image compacte */}
      <div className="relative h-52 w-full overflow-hidden">
        {category && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              {category.name}
            </span>
          </div>
        )}

        {coverImage && (
          <div className="h-full w-full relative overflow-hidden">
            <div className="h-full w-full transform transition-transform duration-500 group-hover:scale-110">
              <CoverImage title={title} coverImage={coverImage} slug={slug} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}
      </div>

      {/* Contenu compact */}
      <div className="p-4 space-y-3">
        {/* Métadonnées condensées */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {formattedDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formattedDate}</span>
            </div>
          )}
          {estimatedReadTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{estimatedReadTime} min</span>
            </div>
          )}
        </div>

        {/* Titre */}
        <h3
          className="font-bold text-lg text-gray-900 leading-tight line-clamp-2 group-hover:text-red-600 transition-colors duration-300"
          dangerouslySetInnerHTML={{ __html: sanitizedTitle }}
        />

        {/* Extrait */}
        {sanitizedExcerpt && (
          <div
            className="text-gray-600 text-sm line-clamp-2 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizedExcerpt }}
          />
        )}

        {/* CTA */}
        <div className="pt-2">
          <span className="inline-flex items-center gap-2 text-red-600 font-semibold text-sm group-hover:gap-3 transition-all">
            Lire l'article
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
