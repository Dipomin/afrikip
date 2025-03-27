import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const LintelligentTv = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Simuler un chargement initial
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleIframeError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-red-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 lg:p-6">
          <h1 className="text-xl lg:text-3xl text-white font-bold text-center mb-4">
            L&apos;intelligent TV - Suivez l&apos;actualité ivoirienne en images
          </h1>
          
          <div className="relative w-full aspect-video">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            )}

            {hasError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
                <AlertCircle className="h-12 w-12 mb-2" />
                <p className="text-center">
                  Impossible de charger le flux vidéo.
                  <br />
                  Veuillez réessayer plus tard.
                </p>
              </div>
            ) : (
              <iframe 
                title="L'intelligent TV Live Stream"
                className="absolute inset-0 w-full h-full"
                src="https://video1.getstreamhosting.com:2000/VideoPlayer/8074?autoplay=1"
                allow="autoplay; fullscreen"
                allowFullScreen
                onError={handleIframeError}
              />
            )}
          </div>

          <div className="mt-4 text-center">
            <p className="text-white text-sm">
              © L&apos;intelligent TV - Tous droits réservés
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LintelligentTv;
