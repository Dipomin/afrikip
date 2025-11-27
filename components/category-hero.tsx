import React from "react";
import { FiTrendingUp, FiUsers, FiGlobe, FiBookOpen } from "react-icons/fi";

interface CategoryHeroProps {
  category: string | null;
  totalPosts: number;
  description: string;
}

const CategoryHero: React.FC<CategoryHeroProps> = ({
  category,
  totalPosts,
  description,
}) => {
  // Configuration des icônes et couleurs par catégorie
  const getCategoryConfig = (categoryName: string | null) => {
    const configs = {
      politique: {
        icon: FiUsers,
        gradient: "from-blue-600 to-indigo-700",
        bgPattern: "bg-blue-50",
        accentColor: "text-blue-600",
        borderColor: "border-blue-200",
      },
      economie: {
        icon: FiTrendingUp,
        gradient: "from-green-600 to-emerald-700",
        bgPattern: "bg-green-50",
        accentColor: "text-green-600",
        borderColor: "border-green-200",
      },
      international: {
        icon: FiGlobe,
        gradient: "from-purple-600 to-violet-700",
        bgPattern: "bg-purple-50",
        accentColor: "text-purple-600",
        borderColor: "border-purple-200",
      },
      culture: {
        icon: FiBookOpen,
        gradient: "from-orange-600 to-red-700",
        bgPattern: "bg-orange-50",
        accentColor: "text-orange-600",
        borderColor: "border-orange-200",
      },
      default: {
        icon: FiGlobe,
        gradient: "from-gray-600 to-gray-800",
        bgPattern: "bg-gray-50",
        accentColor: "text-gray-600",
        borderColor: "border-gray-200",
      },
    };

    return configs[categoryName?.toLowerCase() as keyof typeof configs] || configs.default;
  };

  const config = getCategoryConfig(category);
  const IconComponent = config.icon;

  // Formatage du nom de la catégorie
  const formatCategoryName = (name: string | null) => {
    if (!name) return "Toutes les actualités";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className={`relative overflow-hidden ${config.bgPattern} border-b ${config.borderColor}`}>
      {/* Motif de fond décoratif */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
        <svg
          className="absolute bottom-0 left-0 w-full h-32"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            className="fill-current text-white"
          ></path>
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Icône de catégorie */}
          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-full bg-gradient-to-r ${config.gradient} shadow-lg`}>
              <IconComponent className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Titre principal */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            <span className={`bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
              {formatCategoryName(category)}
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>

          {/* Statistiques */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${config.borderColor} bg-white/80 backdrop-blur-sm`}>
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${config.gradient}`}></div>
              <span className="text-gray-700 font-medium">
                {totalPosts.toLocaleString('fr-FR')} articles disponibles
              </span>
            </div>
            
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${config.borderColor} bg-white/80 backdrop-blur-sm`}>
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${config.gradient}`}></div>
              <span className="text-gray-700 font-medium">
                Mis à jour quotidiennement
              </span>
            </div>
          </div>

          {/* Ligne décorative */}
          <div className="mt-12 flex justify-center">
            <div className={`h-1 w-24 bg-gradient-to-r ${config.gradient} rounded-full`}></div>
          </div>
        </div>
      </div>

      {/* Effet de brillance animé */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-white/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-6 h-6 bg-white/15 rounded-full animate-pulse delay-500"></div>
      </div>
    </div>
  );
};

export default CategoryHero;
