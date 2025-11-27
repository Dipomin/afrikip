import { AppProps } from "next/app";
import "../styles/index.css";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import Modal from "react-modal";
import { CartProvider } from "../contexts/CartContext";
import FirebaseAuthProvider from "../components/SupabaseProvider";
import { useState } from "react";
import Cart from "../components/Cart";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../contexts/CartContext";

// Composant pour le bouton panier flottant
function CartButton() {
  const { getItemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const itemCount = getItemCount();

  return (
    <>
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-[9997] bg-gradient-to-r from-blue-600 to-red-600 text-white w-16 h-16 rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110 flex items-center justify-center group"
        aria-label="Ouvrir le panier"
      >
        <ShoppingCart className="w-7 h-7 group-hover:scale-110 transition-transform" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-4 border-white animate-pulse">
            {itemCount}
          </span>
        )}
      </button>
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

function MyApp({ Component, pageProps }: AppProps) {
  Modal.setAppElement("#__next");

  return (
    <FirebaseAuthProvider>
      <CartProvider>
        <Script src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3317567731429125" />
        <Component {...pageProps} />
        <CartButton />
        <GoogleAnalytics gaId="G-371522159" />
      </CartProvider>
    </FirebaseAuthProvider>
  );
}

export default MyApp;
