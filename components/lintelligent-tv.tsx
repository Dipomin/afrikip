import { useState, useEffect } from "react";
import {
  AlertCircle,
  Tv,
  Radio,
  Users,
  Eye,
  Wifi,
  WifiOff,
  RefreshCw,
  Maximize,
  Volume2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

const LintelligentTv = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");

  useEffect(() => {
    // Simuler un chargement initial avec vérification de connexion
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsLive(true);
      setConnectionStatus("connected");
      // Simuler un nombre de viewers aléatoire
      setViewerCount(Math.floor(Math.random() * 500) + 100);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Simuler la mise à jour du nombre de viewers
  useEffect(() => {
    if (isLive && !hasError) {
      const interval = setInterval(() => {
        setViewerCount((prev) => {
          const change = Math.floor(Math.random() * 20) - 10;
          return Math.max(50, prev + change);
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isLive, hasError]);

  const handleIframeError = () => {
    setHasError(true);
    setIsLoading(false);
    setIsLive(false);
    setConnectionStatus("disconnected");
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setConnectionStatus("connecting");

    setTimeout(() => {
      setIsLoading(false);
      setIsLive(true);
      setConnectionStatus("connected");
    }, 1500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Container principal avec design glassmorphism */}
      <Card className="overflow-hidden border-0 bg-gray-500 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-700">
        {/* Header moderne */}
        <CardHeader className="relative p-6 pb-4 bg-gradient-to-r from-red-600/90 to-blue-700/90 backdrop-blur-sm">
          {/* Effet de brillance animé */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/20 to-transparent opacity-0 animate-pulse" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30">
                  <Tv className="h-8 w-8 text-white" />
                </div>
                {/* Indicateur de statut en direct */}
                {isLive && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </div>

              <div className="text-center sm:text-left">
                <h1 className="text-2xl lg:text-3xl text-white font-bold leading-tight">
                  L&apos;intelligent TV
                </h1>
                <p className="text-white/90 text-sm lg:text-base font-medium">
                  Suivez l&apos;actualité ivoirienne en images
                </p>
              </div>
            </div>

            {/* Badges de statut */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border-0 transition-all duration-300",
                  isLive
                    ? "bg-green-500/90 text-white shadow-lg shadow-green-500/30"
                    : "bg-gray-500/90 text-white"
                )}
              >
                {connectionStatus === "connected" ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    EN DIRECT
                  </>
                ) : connectionStatus === "connecting" ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    CONNEXION...
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    HORS LIGNE
                  </>
                )}
              </Badge>

              {isLive && (
                <Badge className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                  <Users className="h-3 w-3" />
                  {viewerCount.toLocaleString()}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Contenu principal */}
        <CardContent className="p-6 pt-0">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black shadow-2xl">
            {/* États de chargement avec skeleton moderne */}
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                {/* Animation de chargement moderne */}
                <div className="relative mb-6">
                  <div className="h-20 w-20 rounded-full border-4 border-white/20 border-t-white animate-spin"></div>
                  <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-transparent border-r-red-500 animate-spin animation-delay-150"></div>
                </div>

                <div className="text-center space-y-3">
                  <div className="flex items-center gap-2 text-white">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span className="text-lg font-semibold">
                      Connexion en cours...
                    </span>
                  </div>
                  <p className="text-white/70 text-sm">
                    Chargement du flux vidéo en direct
                  </p>
                </div>

                {/* Barres de chargement animées */}
                <div className="mt-8 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-white/30 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 20 + 10}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* État d'erreur moderne */}
            {hasError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-900/20 via-gray-900 to-black text-white p-8">
                <div className="text-center space-y-6 max-w-md">
                  {/* Icône d'erreur avec animation */}
                  <div className="relative mx-auto">
                    <div className="h-20 w-20 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                      <AlertCircle className="h-10 w-10 text-red-400" />
                    </div>
                    <div className="absolute inset-0 h-20 w-20 rounded-full border border-red-500/50 animate-ping"></div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-white">
                      Connexion interrompue
                    </h3>
                    <p className="text-white/80 leading-relaxed">
                      Impossible de charger le flux vidéo en direct. Vérifiez
                      votre connexion internet et réessayez.
                    </p>
                  </div>

                  {/* Bouton de retry moderne */}
                  <Button
                    onClick={handleRetry}
                    className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-xl"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Réessayer
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Iframe du flux vidéo */}
                <iframe
                  title="L'intelligent TV Live Stream"
                  className="absolute inset-0 w-full h-full "
                  src="https://video1.getstreamhosting.com:2000/VideoPlayer/8074?autoplay=1"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  onError={handleIframeError}
                />

                {/* Overlay avec contrôles flottants */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                  {/* Contrôles en bas */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm rounded-lg"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>

                      <div className="text-white text-sm font-medium">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                          EN DIRECT
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm rounded-lg"
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer avec informations et statistiques */}
          <div className="mt-6 space-y-4">
            {/* Statistiques en temps réel */}
            {isLive && !hasError && (
              <div className="flex flex-wrap items-center justify-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300">
                    <span className="font-semibold text-white">
                      {viewerCount.toLocaleString()}
                    </span>{" "}
                    spectateurs
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Radio className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">
                    Qualité <span className="font-semibold text-white">HD</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Wifi className="h-4 w-4 text-emerald-400" />
                  <span className="text-gray-300">
                    Signal{" "}
                    <span className="font-semibold text-white">Excellent</span>
                  </span>
                </div>
              </div>
            )}

            {/* Copyright et informations */}
            <div className="text-center p-4 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-xl">
              <p className="text-white/80 text-sm leading-relaxed">
                © 2024 L&apos;intelligent TV - Tous droits réservés
                <br />
                <span className="text-white/60 text-xs">
                  Diffusion en direct depuis Abidjan, Côte d&apos;Ivoire
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LintelligentTv;
