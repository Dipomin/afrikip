import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Newspaper,
  TrendingUp,
  Clock,
  Users,
  ArrowRight,
  Hash,
  Eye,
  Star,
  Zap,
  Sparkles,
  TrendingDown,
  Activity,
  BarChart3,
} from "lucide-react";
import HomePolitique from "./home-politique";
import PreviewCategorieHomeList from "./preview-categorie-home";
import PreviewMini from "./preview-mini";
import PronosticFoot from "../pubs/pronostic-foot";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

// Variants pour le design moderne de la section
const categorySectionVariants = cva(
  "relative overflow-hidden transition-all duration-700 ease-out group",
  {
    variants: {
      variant: {
        default: [
          "bg-gradient-to-br from-white via-slate-50/30 to-white",
          "border border-slate-200/60 hover:border-slate-300/80",
          "shadow-xl shadow-slate-500/5 hover:shadow-2xl hover:shadow-slate-500/10",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/50 before:via-transparent before:to-slate-100/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        ],
        featured: [
          "bg-gradient-to-br from-red-50 via-orange-50/30 to-amber-50/20",
          "border border-red-200/40 hover:border-red-300/60",
          "shadow-2xl shadow-red-500/10 hover:shadow-3xl hover:shadow-red-500/15",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-red-100/20 before:via-orange-100/10 before:to-amber-100/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        ],
        glassmorphism: [
          "bg-white/20 backdrop-blur-2xl border border-white/30",
          "hover:bg-white/30 hover:border-white/40",
          "shadow-2xl shadow-black/10 hover:shadow-3xl hover:shadow-black/15",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:via-transparent before:to-white/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        ],
        minimal: [
          "bg-white/95 border border-slate-150/50",
          "hover:border-slate-200/70 hover:shadow-2xl hover:shadow-slate-500/8",
          "transition-all duration-500 ease-out",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-slate-50/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        ],
        premium: [
          "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
          "border border-slate-700/50 hover:border-slate-600/70",
          "shadow-2xl shadow-black/20 hover:shadow-3xl hover:shadow-black/30",
          "text-white",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-slate-700/20 before:via-transparent before:to-slate-800/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        ],
      },
      spacing: {
        compact: "p-5 space-y-5",
        default: "p-8 space-y-8",
        relaxed: "p-10 space-y-10",
        luxurious: "p-12 space-y-12",
      },
      borderRadius: {
        none: "rounded-none",
        small: "rounded-lg",
        default: "rounded-2xl",
        large: "rounded-3xl",
        full: "rounded-[2rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      spacing: "default",
      borderRadius: "default",
    },
  }
);

interface PostEdge {
  node: {
    [key: string]: any;
  };
}

interface CategorySectionProps
  extends VariantProps<typeof categorySectionVariants> {
  title: string;
  mainPosts: PostEdge[];
  listOnePosts: PostEdge[];
  listTwoPosts: PostEdge[];
  miniPosts: PostEdge[];
  showPronostic?: boolean;
  showMini?: boolean;
  icon?: React.ReactNode;
  description?: string;
  featured?: boolean;
  trending?: boolean;
  premium?: boolean;
  stats?: {
    totalViews?: number;
    totalArticles?: number;
    engagement?: number;
  };
  className?: string;
}

/**
 * Composant réutilisable pour afficher une section de catégorie
 * Version moderne avec design premium, glassmorphism et animations avancées
 */
const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  mainPosts,
  listOnePosts,
  listTwoPosts,
  miniPosts,
  showPronostic = false,
  showMini = true,
  icon,
  description,
  featured = false,
  trending = false,
  premium = false,
  stats,
  variant = "default",
  spacing = "default",
  borderRadius = "default",
  className,
}) => {
  // Calculer le nombre total d'articles
  const totalPosts =
    mainPosts.length +
    listOnePosts.length +
    listTwoPosts.length +
    miniPosts.length;

  // Déterminer l'icône par défaut selon le titre avec plus d'options
  const getDefaultIcon = () => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes("politique")) return <Hash className="h-5 w-5" />;
    if (titleLower.includes("sport")) return <Zap className="h-5 w-5" />;
    if (titleLower.includes("économie") || titleLower.includes("finance"))
      return <TrendingUp className="h-5 w-5" />;
    if (titleLower.includes("international") || titleLower.includes("monde"))
      return <Users className="h-5 w-5" />;
    if (titleLower.includes("tech") || titleLower.includes("technologie"))
      return <Activity className="h-5 w-5" />;
    if (titleLower.includes("culture") || titleLower.includes("art"))
      return <Sparkles className="h-5 w-5" />;
    if (titleLower.includes("analyse") || titleLower.includes("opinion"))
      return <BarChart3 className="h-5 w-5" />;
    return <Newspaper className="h-5 w-5" />;
  };

  const displayIcon = icon || getDefaultIcon();

  // Déterminer la variante selon les props
  const getVariant = () => {
    if (premium) return "premium";
    if (featured) return "featured";
    return variant;
  };

  return (
    <Card
      className={cn(
        categorySectionVariants({
          variant: getVariant(),
          spacing,
          borderRadius,
        }),
        "mb-10 border-0 relative overflow-hidden",
        className
      )}
    >
      {/* Effet de brillance animé premium */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]" />

      {/* Overlay décoratif pour variant premium */}
      {(premium || getVariant() === "premium") && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 via-transparent to-slate-900/30 pointer-events-none" />
      )}

      {/* Pattern décoratif en arrière-plan */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-slate-100/20 via-transparent to-transparent rounded-full -translate-y-32 translate-x-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-red-100/10 via-transparent to-transparent rounded-full translate-y-24 -translate-x-24 pointer-events-none" />

      {/* Header moderne de la section */}
      <CardHeader className="relative pb-6 z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            {/* Icône avec effet premium */}
            <div className="relative group/icon">
              <div
                className={cn(
                  "h-14 w-14 rounded-2xl flex items-center justify-center border shadow-lg transition-all duration-500 group-hover/icon:scale-110 group-hover/icon:rotate-3",
                  premium || getVariant() === "premium"
                    ? "bg-gradient-to-br from-slate-700/80 to-slate-800/80 backdrop-blur-sm border-slate-600/50 text-slate-200"
                    : "bg-gradient-to-br from-red-500/15 to-orange-500/15 backdrop-blur-sm border-red-200/30 text-red-600"
                )}
              >
                <div className="transition-transform duration-300 group-hover/icon:scale-110">
                  {displayIcon}
                </div>
              </div>

              {/* Indicateurs de statut */}
              {trending && (
                <div className="absolute -top-2 -right-2 h-6 w-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
              )}

              {featured && !trending && (
                <div className="absolute -top-2 -right-2 h-6 w-6 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                  <Star className="h-3 w-3 text-white" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h2
                  className={cn(
                    "text-3xl lg:text-4xl font-bold tracking-tight transition-all duration-300 group-hover:translate-x-1",
                    premium || getVariant() === "premium"
                      ? "bg-gradient-to-r from-slate-100 via-white to-slate-200 bg-clip-text text-transparent"
                      : "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent"
                  )}
                >
                  {title}
                </h2>

                {/* Badges de statut améliorés */}
                <div className="flex items-center gap-2">
                  {featured && (
                    <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <Star className="h-3 w-3 mr-1.5" />À la une
                    </Badge>
                  )}

                  {trending && (
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <TrendingUp className="h-3 w-3 mr-1.5" />
                      Tendance
                    </Badge>
                  )}

                  {premium && (
                    <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <Sparkles className="h-3 w-3 mr-1.5" />
                      Premium
                    </Badge>
                  )}
                </div>
              </div>

              {description && (
                <p
                  className={cn(
                    "text-base lg:text-lg font-medium leading-relaxed",
                    premium || getVariant() === "premium"
                      ? "text-slate-300"
                      : "text-slate-600"
                  )}
                >
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Statistiques et actions améliorées */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Statistiques premium */}

            {/* Bouton d'action premium */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center gap-2 font-semibold transition-all duration-300 hover:scale-105 group/btn",
                premium || getVariant() === "premium"
                  ? "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  : "text-slate-600 hover:text-red-600 hover:bg-red-50/80"
              )}
            >
              Voir tout
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Contenu principal avec layout moderne */}
      <CardContent className="space-y-8 relative z-10">
        {/* Section principale et listes latérales */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Article principal */}
          {mainPosts.length > 0 && (
            <div className="lg:col-span-6">
              <div
                className={cn(
                  "rounded-2xl p-6 border transition-all duration-500 hover:shadow-xl group/main",
                  premium || getVariant() === "premium"
                    ? "bg-slate-800/50 backdrop-blur-sm border-slate-700/50 "
                    : "bg-white/70 backdrop-blur-sm border-slate-200/50  "
                )}
              >
                <div className="flex justify-center item-center transform transition-transform duration-300 group-hover/main:scale-[1.02]">
                  <HomePolitique posts={mainPosts} />
                </div>
              </div>
            </div>
          )}

          {/* Listes d'articles */}
          <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Liste 1 */}
            {listOnePosts.length > 0 && (
              <div
                className={cn(
                  "rounded-2xl p-5 border transition-all duration-500 hover:shadow-lg group/list1",
                  premium || getVariant() === "premium"
                    ? "bg-slate-800/30 backdrop-blur-sm border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-700/40"
                    : "bg-white/50 backdrop-blur-sm border-slate-200/30 hover:border-slate-300/50 hover:bg-white/70"
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-1 w-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
                  <span
                    className={cn(
                      "text-sm font-bold tracking-wide uppercase",
                      premium || getVariant() === "premium"
                        ? "text-slate-300"
                        : "text-slate-700"
                    )}
                  >
                    Articles récents
                  </span>
                </div>
                <div className="transform transition-transform duration-300 group-hover/list1:translate-y-[-2px]">
                  <PreviewCategorieHomeList posts={listOnePosts} />
                </div>
              </div>
            )}

            {/* Liste 2 */}
            <div className="space-y-6">
              {listTwoPosts.length > 0 && (
                <div
                  className={cn(
                    "rounded-2xl p-5 border transition-all duration-500 hover:shadow-lg group/list2",
                    premium || getVariant() === "premium"
                      ? "bg-slate-800/30 backdrop-blur-sm border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-700/40"
                      : "bg-white/50 backdrop-blur-sm border-slate-200/30 hover:border-slate-300/50 hover:bg-white/70"
                  )}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-1 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    <span
                      className={cn(
                        "text-sm font-bold tracking-wide uppercase",
                        premium || getVariant() === "premium"
                          ? "text-slate-300"
                          : "text-slate-700"
                      )}
                    >
                      À découvrir
                    </span>
                  </div>
                  <div className="transform transition-transform duration-300 group-hover/list2:translate-y-[-2px]">
                    <PreviewCategorieHomeList posts={listTwoPosts} />
                  </div>
                </div>
              )}

              {/* Pronostic si activé */}
              {showPronostic && (
                <div className="bg-gradient-to-br from-emerald-500/15 to-teal-500/15 backdrop-blur-sm rounded-2xl p-5 border border-emerald-200/50 hover:border-emerald-300/70 transition-all duration-500 hover:shadow-lg group/prono">
                  <div className="transform transition-transform duration-300 group-hover/prono:scale-[1.02]">
                    <PronosticFoot />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section mini articles (desktop uniquement) */}
        {showMini && miniPosts.length > 0 && (
          <div className="hidden lg:block">
            <div
              className={cn(
                "rounded-2xl p-8 border shadow-lg transition-all duration-500 hover:shadow-xl group/mini",
                premium || getVariant() === "premium"
                  ? "bg-gradient-to-r from-slate-800/60 via-slate-700/40 to-slate-800/60 border-slate-700/50"
                  : "bg-gradient-to-r from-slate-50 via-white to-slate-50 border-slate-200/50"
              )}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover/mini:scale-110",
                    premium || getVariant() === "premium"
                      ? "bg-gradient-to-br from-slate-600/60 to-slate-700/60"
                      : "bg-gradient-to-br from-slate-400/20 to-slate-600/20"
                  )}
                >
                  <Clock
                    className={cn(
                      "h-5 w-5",
                      premium || getVariant() === "premium"
                        ? "text-slate-300"
                        : "text-slate-600"
                    )}
                  />
                </div>
                <h3
                  className={cn(
                    "text-xl font-bold tracking-tight",
                    premium || getVariant() === "premium"
                      ? "text-slate-200"
                      : "text-slate-800"
                  )}
                >
                  Dernières actualités
                </h3>
                <div
                  className={cn(
                    "flex-1 h-px bg-gradient-to-r to-transparent",
                    premium || getVariant() === "premium"
                      ? "from-slate-600"
                      : "from-slate-300"
                  )}
                ></div>

                {/* Indicateur de mise à jour */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      premium || getVariant() === "premium"
                        ? "text-slate-400"
                        : "text-slate-500"
                    )}
                  >
                    Mis à jour
                  </span>
                </div>
              </div>
              <div className="transform transition-transform duration-300 group-hover/mini:translate-y-[-2px]">
                <PreviewMini posts={miniPosts} />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategorySection;
