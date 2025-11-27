import React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import {
  AlertTriangle,
  Clock,
  TrendingUp,
  Flame,
  Zap,
  ArrowRight,
} from "lucide-react";

// Variants pour le composant AlertTitle - Design moderne et professionnel
const alertTitleVariants = cva(
  "group relative inline-flex items-center gap-2.5 px-5 py-2.5 font-semibold transition-all duration-300 ease-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] overflow-hidden backdrop-blur-sm",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 border-l-4 border-red-400/50",
        urgent:
          "bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white shadow-xl shadow-red-600/50 hover:shadow-2xl hover:shadow-red-600/60 border-l-4 border-red-300 animate-pulse-subtle",
        breaking:
          "bg-gradient-to-r from-rose-600 via-red-600 to-orange-600 text-white shadow-xl shadow-rose-500/40 hover:shadow-2xl hover:shadow-rose-500/50 border-l-4 border-rose-300",
        trending:
          "bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 border-l-4 border-amber-400/50",
        info: "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 border-l-4 border-blue-400/50",
      },
      size: {
        sm: "text-xs px-3 py-2 gap-1.5",
        default: "text-sm px-5 py-2.5 gap-2.5",
        lg: "text-base px-6 py-3 gap-3",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-md",
        md: "rounded-lg",
        lg: "rounded-xl",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "lg",
    },
  }
);

// Types TypeScript pour les props
interface AlertTitleProps extends VariantProps<typeof alertTitleVariants> {
  title: string;
  slug?: string;
  showIcon?: boolean;
  isClickable?: boolean;
  className?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  timestamp?: string;
  category?: string;
  categories?: Array<{
    slug: string;
    name: string;
  }>;
  showCategory?: boolean;
  enableScrolling?: boolean;
}

// Fonction pour nettoyer le HTML (sécurité basique)
const sanitizeHtml = (html: string): string => {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+="[^"]*"/gi, "");
};

// Fonction pour obtenir l'icône selon la variante - Icons améliorées
const getIcon = (variant: string | null | undefined, priority?: string) => {
  if (priority === "urgent" || variant === "urgent") {
    return (
      <div className="relative">
        <AlertTriangle className="h-5 w-5 animate-pulse" />
        <div className="absolute inset-0 h-5 w-5 animate-ping">
          <AlertTriangle className="h-5 w-5 opacity-75" />
        </div>
      </div>
    );
  }
  if (variant === "breaking") {
    return <Flame className="h-5 w-5 animate-bounce-subtle" />;
  }
  if (variant === "trending") {
    return <TrendingUp className="h-5 w-5" />;
  }
  if (variant === "info") {
    return <Zap className="h-5 w-5" />;
  }
  return <Clock className="h-5 w-5" />;
};

/**
 * Composant AlertTitle moderne et professionnel
 * Affiche un titre d'alerte avec différents styles et fonctionnalités
 */
export default function AlertTitle({
  title,
  slug,
  variant = "default",
  size = "default",
  rounded = "sm",
  showIcon = true,
  isClickable = true,
  className,
  priority = "medium",
  timestamp,
  category,
  categories = [],
  showCategory = true,
  enableScrolling = false,
}: AlertTitleProps) {
  // Déterminer la variante basée sur la priorité
  const getVariantFromPriority = () => {
    if (priority === "urgent") return "urgent";
    if (priority === "high") return "breaking";
    if (category === "trending") return "trending";
    return variant;
  };

  const finalVariant = getVariantFromPriority();
  const sanitizedTitle = sanitizeHtml(title);

  // Obtenir la première catégorie principale pour l'affichage
  const primaryCategory = categories.length > 0 ? categories[0] : null;

  // Contenu du composant - Design modernisé
  const content = (
    <div
      className={cn(
        alertTitleVariants({ variant: finalVariant, size, rounded }),
        enableScrolling && "animate-scroll-left",
        "cursor-pointer",
        className
      )}
      role="alert"
      aria-live="polite"
      aria-label={`Alerte: ${title}`}
    >
      {/* Background animated pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]" />
      </div>

      {/* Icon avec animation */}
      {showIcon && (
        <div className="relative z-10 flex-shrink-0">
          {getIcon(finalVariant, priority)}
        </div>
      )}

      {/* Badge catégorie amélioré */}
      {showCategory && primaryCategory && (
        <span className="relative z-10 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/25 backdrop-blur-sm text-white border border-white/30 shadow-sm flex-shrink-0 transition-all duration-200 group-hover:bg-white/35 group-hover:scale-105">
          <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
          {primaryCategory.name.toUpperCase()}
        </span>
      )}

      {/* Texte du titre avec meilleure lisibilité */}
      <span
        className="relative z-10 flex-1 truncate font-semibold tracking-wide"
        dangerouslySetInnerHTML={{ __html: sanitizedTitle }}
      />

      {/* Timestamp modernisé */}
      {timestamp && (
        <time
          className="relative z-10 text-xs font-medium opacity-90 ml-2 flex-shrink-0 bg-white/15 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/20"
          dateTime={timestamp}
        >
          {new Date(timestamp).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      )}

      {/* Flèche de navigation */}
      {isClickable && slug && (
        <ArrowRight className="relative z-10 h-4 w-4 flex-shrink-0 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
      )}

      {/* Effet de brillance amélioré */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%]" />

      {/* Bordure lumineuse animée */}
      <div className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 rounded-[inherit] border-2 border-white/30 animate-pulse-border" />
      </div>
    </div>
  );

  // Si cliquable et qu'on a un slug, envelopper dans un Link
  if (isClickable && slug) {
    return (
      <Link
        href={`/article/${slug}`}
        className="inline-block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-sm"
        aria-label={`Lire l'article: ${title}`}
      >
        {content}
      </Link>
    );
  }

  return content;
}
