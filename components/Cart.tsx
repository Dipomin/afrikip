"use client";

import React from "react";
import { useCart } from "../contexts/CartContext";
import { X, ShoppingCart, Trash2, ArrowRight, Package } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { items, removeFromCart, getTotalPrice, getItemCount, clearCart } =
    useCart();
  const router = useRouter();

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-[9999] flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-red-600 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-black">Mon Panier</h2>
              <p className="text-blue-100 text-sm">
                {getItemCount()} {getItemCount() > 1 ? "articles" : "article"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenu */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Votre panier est vide
            </h3>
            <p className="text-gray-600 mb-6">
              Ajoutez des journaux pour commencer votre commande
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Parcourir les journaux
            </button>
          </div>
        ) : (
          <>
            {/* Liste des articles */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={item.coverImageURL}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1 truncate">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.issueNumber}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-blue-600">
                          {item.price.toLocaleString()} F CFA
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Retirer du panier"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer avec total et actions */}
            <div className="border-t-2 border-gray-200 bg-gray-50 p-6 space-y-4">
              {/* Bouton vider panier */}
              {items.length > 1 && (
                <button
                  onClick={clearCart}
                  className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold"
                >
                  Vider le panier
                </button>
              )}

              {/* Total */}
              <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-semibold">
                    {getTotalPrice().toLocaleString()} F CFA
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-black text-blue-600">
                    {getTotalPrice().toLocaleString()} F CFA
                  </span>
                </div>
              </div>

              {/* Bouton commander */}
              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-blue-600 to-red-600 text-white py-4 rounded-xl font-black text-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 group"
              >
                <span>Passer la commande</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-xs text-center text-gray-500">
                Paiement sécurisé par CinetPay
              </p>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
