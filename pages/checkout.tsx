import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { useCart } from "../contexts/CartContext";
import { useRouter } from "next/router";
import Layout from "../components/layout";
import Image from "next/image";
import {
  ShoppingBag,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formulaire
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    country: "Côte d'Ivoire",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      setError("Veuillez renseigner votre nom complet");
      return false;
    }
    if (!formData.email || !formData.email.includes("@")) {
      setError("Veuillez renseigner une adresse email valide");
      return false;
    }
    if (!formData.phone || formData.phone.length < 8) {
      setError("Veuillez renseigner un numéro de téléphone valide");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    if (items.length === 0) {
      setError("Votre panier est vide");
      return;
    }

    setIsProcessing(true);

    try {
      // Créer la commande et initier le paiement CinetPay
      const response = await fetch("/api/cinetpay-pdf-purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: formData,
          items: items,
          total: getTotalPrice(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors de la création de la commande"
        );
      }

      // Rediriger vers la page de paiement CinetPay
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error("URL de paiement non reçue");
      }
    } catch (err: any) {
      console.error("Erreur checkout:", err);
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.");
      setIsProcessing(false);
    }
  };

  // Rediriger si panier vide
  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">
              Panier vide
            </h2>
            <p className="text-gray-600 mb-6">
              Ajoutez des journaux à votre panier pour continuer
            </p>
            <button
              onClick={() => router.push("/lintelligentpdf/aujourdhui")}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Parcourir les journaux
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Retour</span>
            </button>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
              Finaliser la commande
            </h1>
            <p className="text-gray-600 text-lg">
              Complétez vos informations pour procéder au paiement
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Formulaire */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations personnelles */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">
                      Informations personnelles
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Jean"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nom *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Kouassi"
                      />
                    </div>
                  </div>
                </div>

                {/* Coordonnées */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">
                      Coordonnées
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="jean.kouassi@example.com"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Vos journaux seront envoyés à cette adresse
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="+225 07 XX XX XX XX"
                      />
                    </div>
                  </div>
                </div>

                {/* Localisation */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">
                      Localisation
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ville
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Abidjan"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pays
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="Côte d'Ivoire">
                          Côte d&apos;Ivoire
                        </option>
                        <option value="Sénégal">Sénégal</option>
                        <option value="Mali">Mali</option>
                        <option value="Burkina Faso">Burkina Faso</option>
                        <option value="Bénin">Bénin</option>
                        <option value="Togo">Togo</option>
                        <option value="Niger">Niger</option>
                        <option value="Guinée">Guinée</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Message d'erreur */}
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <div className="text-red-600 text-xl">⚠️</div>
                    <p className="text-red-800 font-semibold">{error}</p>
                  </div>
                )}

                {/* Bouton de paiement */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-blue-600 to-red-600 text-white py-4 rounded-xl font-black text-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Traitement en cours...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6" />
                      <span>
                        Payer {getTotalPrice().toLocaleString()} F CFA
                      </span>
                    </>
                  )}
                </button>

                <p className="text-sm text-center text-gray-500">
                  🔒 Paiement 100% sécurisé par CinetPay (Mobile Money)
                </p>
              </form>
            </div>

            {/* Récapitulatif */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
                  <h2 className="text-2xl font-black text-gray-900 mb-6">
                    Récapitulatif
                  </h2>

                  {/* Articles */}
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 pb-4 border-b border-gray-200 last:border-0"
                      >
                        <div className="relative w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={item.coverImageURL}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-600 mb-2">
                            {item.issueNumber}
                          </p>
                          <p className="text-sm font-black text-blue-600">
                            {item.price.toLocaleString()} F CFA
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totaux */}
                  <div className="border-t-2 border-gray-200 pt-4 space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>Sous-total</span>
                      <span className="font-semibold">
                        {getTotalPrice().toLocaleString()} F CFA
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-black text-gray-900 pt-3 border-t border-gray-200">
                      <span>Total</span>
                      <span className="text-2xl text-blue-600">
                        {getTotalPrice().toLocaleString()} F CFA
                      </span>
                    </div>
                  </div>

                  {/* Avantages */}
                  <div className="mt-6 pt-6 border-t-2 border-gray-200 space-y-3">
                    <div className="flex items-start gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Accès immédiat après paiement</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>PDFs téléchargeables à vie</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Paiement Mobile Money sécurisé</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
