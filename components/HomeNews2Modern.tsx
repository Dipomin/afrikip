import React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { 
  Clock, 
  User, 
  Calendar, 
  ArrowUpRight, 
  Eye, 
  BookOpen, 
  TrendingUp,
  Bookmark,
  Share2,
  Heart
} from "lucide-react";
import CoverImage from "./cover-image";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

// Variants pour le design ultra-moderne
const modernNewsVariants = cva(
  "group relative overflow-hidden transition-all duration-700 ease-out cursor-pointer",
  {
    variants: {
      variant: {
        glassmorphism: [
          "bg-white/10 backdrop-blur-xl border border-white/20",
          "hover:bg-white/20 hover:border-white/30",
          "shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500"
        ],
        neumorphism: [
          "bg-gray-50 border-0",
          "shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]",
          "hover:shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff]",
          "dark:bg-gray-800 dark:shadow-[8px_8px_16px_#1a1a1a,-8px_-8px_16px_#2a2a2a]"
        ],
        brutalist: [
          "bg-black text-white border-4 border-yellow-400",
          "hover:border-cyan-400 hover:bg-gray-900",
          "shadow-[8px_8px_0px_#eab308] hover:shadow-[12px_12px_0px_#06b6d4]",
          "transform hover:-translate-x-1 hover:-translate-y-1"
        ],
        gradient: [
          "bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10",
          "border border-purple-200/50 hover:border-purple-300/70",
          "hover:from-purple-500/20 hover:via-pink-500/20 hover:to-orange-500/20",
          "shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20"
        ],
        minimal: [
          "bg-white border border-gray-100",
          "hover:border-gray-200 hover:shadow-lg",
          "transition-all duration-300"
        ],
        magazine: [
          "bg-white border-l-4 border-l-red-500",
          "hover:border-l-red-600 hover:shadow-xl",
          "shadow-md hover:shadow-lg"
        ]
      },
      size: {
        compact: "max-w-xs",
        default: "max-w-sm",
        large: "max-w-md",
        hero: "max-w-2xl",
      },
      layout: {
        card: "flex-col rounded-2xl",
        horizontal: "flex-row rounded-xl",
        overlay: "relative rounded-3xl",
      },
    },
    defaultVariants: {
      variant: "glassmorphism",
      size: "default",
      layout: "card",
    },
  }
);

// Types pour les métadonnées enrichies
interface Author {
  name?: string;
  avatar?: string;
  role?: string;
  verified?: boolean;
}

interface Category {
  name: string;
  slug: string;
  color?: string;
  icon?: string;
}

interface Engagement {
  likes?: number;
  shares?: number;
  bookmarks?: number;
  comments?: number;
}

interface HomeNews2ModernProps extends VariantProps<typeof modernNewsVariants> {
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
  engagement?: Engagement;
  featured?: boolean;
  trending?: boolean;
  premium?: boolean;
  className?: string;
  showActions?: boolean;
  showEngagement?: boolean;
}

// Fonction utilitaire pour formater les nombres
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Fonction pour formater la date de manière moderne
const formatModernDate = (dateString?: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}j`;
    
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  } catch {
    return '';
  }
};

// Fonction pour sanitiser le HTML
const sanitizeHtml = (html: string): string => {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '');
};

/**
 * Composant HomeNews2Modern - Design ultra-moderne et professionnel
 * Inspiré des meilleures pratiques de design contemporain
 */
export default function HomeNews2Modern({
  title,
  coverImage,
  excerpt,
  slug,
  date,
  author,
  category,
  readTime,
  views,
  engagement,
  featured = false,
  trending = false,
  premium = false,
  variant = "glassmorphism",
  size = "default",
  layout = "card",
  className,
  showActions = true,
  showEngagement = true,
}: HomeNews2ModernProps) {
  const sanitizedTitle = sanitizeHtml(title);
  const sanitizedExcerpt = excerpt ? sanitizeHtml(excerpt) : '';
  const formattedDate = formatModernDate(date);

  return (
    <article 
      className={cn(
        modernNewsVariants({ variant, size, layout }),
        "group/card",
        className
      )}
      role="article"
      aria-label={`Article: ${title}`}
    >
      <Link 
        href={`/article/${slug}`}
        className="block h-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-2xl"
        aria-label={`Lire l'article: ${title}`}
      >
        {/* Header avec badges et actions */}
        <div className="relative p-4 pb-0">
          <div className="flex items-start justify-between mb-3">
            {/* Badges de statut */}
            <div className="flex items-center gap-2 flex-wrap">
              {featured && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold animate-pulse">
                  ⭐ À la une
                </Badge>
              )}
              {trending && (
                <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Tendance
                </Badge>
              )}
              {premium && (
                <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  👑 Premium
                </Badge>
              )}
              {category && (
                <Badge 
                  variant="secondary" 
                  className="bg-black/10 text-gray-700 hover:bg-black/20 transition-colors"
                >
                  {category.icon && <span className="mr-1">{category.icon}</span>}
                  {category.name}
                </Badge>
              )}
            </div>

            {/* Actions rapides */}
            {showActions && (
              <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-black/10">
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-black/10">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Image avec overlay moderne */}
        <div className="relative mx-4 mb-4 overflow-hidden rounded-xl">
          <div className="aspect-[16/10] relative">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
            
            {/* Image avec effet parallax */}
            <div className="h-full w-full transform transition-all duration-700 group-hover/card:scale-110">
              <CoverImage 
                title={title} 
                coverImage={coverImage} 
                slug={slug}
              />
            </div>

            {/* Effet de brillance diagonal */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-500 transform rotate-12 scale-150 translate-x-[-100%] group-hover/card:translate-x-[100%]" />

            {/* Métadonnées sur l'image */}
            <div className="absolute bottom-3 left-3 right-3 z-20">
              <div className="flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-3">
                  {formattedDate && (
                    <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formattedDate}</span>
                    </div>
                  )}
                  {readTime && (
                    <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1">
                      <Clock className="h-3 w-3" />
                      <span>{readTime} min</span>
                    </div>
                  )}
                </div>
                
                {views && (
                  <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1">
                    <Eye className="h-3 w-3" />
                    <span>{formatNumber(views)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="px-4 pb-4">
          {/* Titre avec animation */}
          <h3
            className={cn(
              "font-bold text-lg leading-tight mb-3",
              "group-hover/card:text-purple-600 transition-colors duration-300",
              "line-clamp-2"
            )}
            dangerouslySetInnerHTML={{ __html: sanitizedTitle }}
          />

          {/* Extrait */}
          {sanitizedExcerpt && (
            <p
              className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3"
              dangerouslySetInnerHTML={{ __html: sanitizedExcerpt }}
            />
          )}

          {/* Footer avec auteur et engagement */}
          <div className="space-y-3">
            {/* Auteur */}
            {author && (
              <div className="flex items-center gap-2">
                {author.avatar && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-semibold">
                    {author.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {author.name}
                    </span>
                    {author.verified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  {author.role && (
                    <span className="text-xs text-gray-500">{author.role}</span>
                  )}
                </div>
              </div>
            )}

            {/* Engagement et CTA */}
            <div className="flex items-center justify-between">
              {/* Métriques d'engagement */}
              {showEngagement && engagement && (
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {engagement.likes && (
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{formatNumber(engagement.likes)}</span>
                    </div>
                  )}
                  {engagement.comments && (
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      <span>{formatNumber(engagement.comments)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* CTA moderne */}
              <div className="flex items-center gap-2 text-purple-600 font-medium text-sm group-hover/card:text-purple-700 transition-colors">
                <span>Lire</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
