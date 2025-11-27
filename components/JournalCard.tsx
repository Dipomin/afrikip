"use client";

import React from "react";
import {
  Calendar,
  Hash,
  Eye,
  Download,
  FileText,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import { useCart } from "../contexts/CartContext";

interface JournalCardProps {
  id: string;
  title: string;
  issueNumber: string;
  publicationDate: Date;
  coverImageURL: string;
  pdfURL: string;
  year: string;
  description?: string;
  tags?: string[];
  views?: number;
  downloads?: number;
  onClick: () => void;
}

const JOURNAL_PRICE = 200; // Prix en F CFA

export default function JournalCard({
  id,
  title,
  issueNumber,
  publicationDate,
  coverImageURL,
  pdfURL,
  year,
  description,
  tags,
  views = 0,
  downloads = 0,
  onClick,
}: JournalCardProps) {
  const { addToCart, isInCart } = useCart();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher l'ouverture du modal

    if (isInCart(id)) {
      return; // Déjà dans le panier
    }

    addToCart({
      id,
      title,
      issueNumber,
      coverImageURL,
      pdfURL,
      price: JOURNAL_PRICE,
      publicationDate: formatDate(publicationDate),
      year,
    });
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Image de couverture */}
      <div className="relative h-80 w-full overflow-hidden bg-gray-100">
        <Image
          src={coverImageURL}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Overlay avec icône PDF */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
            <FileText className="w-8 h-8" />
            <span className="text-sm font-semibold">Cliquer pour lire</span>
          </div>
        </div>

        {/* Badge numéro */}
        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
          {issueNumber}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-5 space-y-3">
        {/* Titre */}
        <h3 className="text-lg font-black text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(publicationDate)}</span>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-medium">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Statistiques */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Eye className="w-3.5 h-3.5" />
            <span>{views}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Download className="w-3.5 h-3.5" />
            <span>{downloads}</span>
          </div>
        </div>

        {/* Bouton d'achat */}
        <button
          onClick={handleAddToCart}
          disabled={isInCart(id)}
          className={`w-full py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            isInCart(id)
              ? "bg-green-100 text-green-700 cursor-default"
              : "bg-gradient-to-r from-blue-600 to-red-600 text-white hover:shadow-lg hover:scale-[1.02]"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>
            {isInCart(id)
              ? "Dans le panier"
              : `Acheter - ${JOURNAL_PRICE} F CFA`}
          </span>
        </button>
      </div>

      {/* Indicateur hover */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </div>
  );
}
