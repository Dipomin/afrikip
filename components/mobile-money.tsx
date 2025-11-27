"use client";

import { useState } from "react";
import axios, { AxiosResponse } from "axios";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { Button } from "../@/components/ui/button";




interface ApiResponse {
  payment_url: string;
}

export default function MobileMoney() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    amount: 3000,
    currency: "XOF",
    alternative_currency: "",
    description: "",
    customer_name: "",
    customer_surname: "",
    customer_email: "",
    customer_phone_number: "",
    customer_address: "",
    customer_city: "",
    customer_country: "",
    customer_state: "",
    customer_zip_code: "",
    notify_url: "",
    return_url: "",
    channels: "MOBILE_MONEY",
    metadata: "",
    lang: "fr",
    invoice_data: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        try {
          const response: AxiosResponse<ApiResponse> = await axios.post(
            "/api/cinetpay",
            formData
          );
          console.log("Complete API response", response);

          if (response.data && response.data.payment_url) {
            const payment_url = response.data.payment_url;

            if (payment_url) {
              router.push(payment_url);
            } else {
              console.error("Payment url not available");
            }
          } else {
            console.error("Unexpected API response format", response.data);
          }
        } catch (error) {
          console.error(error);
        }
    } catch (error) {
      console.error("Erreur lors de l'insertion des données :", error);
    }
  };

  return (
    <div>
      <Head>
        <title>Formulaire de Paiement</title>
      </Head>
      <form onSubmit={handleSubmit}>
        <h1 className="text-white text-4xl font-bold text-center">
          Paiement mobile
        </h1>
        <div className="text-gray-400 my-8 pl-10">
          <div className="my-8">
            <input
              type="text"
              name="customer_name"
              placeholder="Nom"
              value={formData.customer_name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="my-8">
            <input
              type="text"
              name="customer_surname"
              placeholder="Prénoms"
              value={formData.customer_surname}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="my-8">
            <input
              type="text"
              name="customer_email"
              placeholder="Adresse email"
              value={formData.customer_email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="my-8">
            <input
              type="text"
              name="customer_phone_number"
              placeholder="Numéro de téléphone"
              value={formData.customer_phone_number}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="my-8">
            <input
              type="text"
              name="customer_address"
              placeholder="Adresse"
              value={formData.customer_address}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="my-8">
            <input
              type="text"
              name="customer_city"
              placeholder="Ville"
              value={formData.customer_city}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="my-8">
            <input
              type="text"
              name="customer_country"
              placeholder="Pays"
              value={formData.customer_country}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="my-8">
            <input
              type="text"
              name="customer_state"
              placeholder="Région"
              value={formData.customer_state}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="my-8">
            <input
              type="text"
              name="customer_zip_code"
              placeholder="Code postal"
              value={formData.customer_zip_code}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>{formData.amount}</div>
          <div>
            <Button type="submit">Effectuer le paiement</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
