"use client";

import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { createClient } from "@supabase/supabase-js";

import { Database } from "../../../types_db";
import { useSession } from "@supabase/auth-helpers-react";
import Router from "next/router";
import Image from "next/image";
import Button from "../../../app/abonnement/components/ui/Button";
import Layout from "../../../components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../@/components/ui/card";
import RootLayout from "../../../app/layout";
import { useRouter } from "next/navigation";
import LayoutAbonne from "../../../components/layout-abonne";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

interface ApiResponse {
  payment_url: string;
}

const PaiementSemestriel = () => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const session = useSession();

  const user = session?.user;

  const randomCustomerId = Math.floor(Math.random() * 100000000).toString();
  const randomTransactionId = Math.floor(Math.random() * 100000000).toString();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const [formData, setFormData] = useState({
    amount: 6500,
    currency: "XOF",
    transaction_id: Number(randomCustomerId),
    customer_id: Number(randomTransactionId),
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
    notify_url: "https://www.afrikipresse.fr/mobile-payment/notify",
    return_url: "",
    channels: "MOBILE_MONEY",
    metadata: "",
    lang: "fr",
    invoice_data: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Insérez les données du formulaire dans la table mobilepayment de Supabase
      const { data, error } = await supabase
        .from("mobilepayment")
        .upsert([formData]);

      if (error) {
        throw error;
      } else {
        try {
          const response: AxiosResponse<ApiResponse> = await axios.post(
            "/api/cinetpay-s",
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
      }
    } catch (error) {
      console.error("Erreur lors de l'insertion des données :", error);
    }
  };

  return (
    <Layout user={user} preview={""}>
      <div className="bg-gray-500">
        <div className="grid justify-items-center">
          <div>
            <h1 className="text-black text-4xl font-bold text-center">
              Paiement mobile
            </h1>
            <h3 className="text-black text-lg my-10 text-center">
              Moyens de paiements mobile acceptés{" "}
            </h3>
            <div className="flex justify-center pb-10">
              <div className="flex gap-x-5">
                <div>
                  <Image
                    src="/orange-money.png"
                    width="50"
                    height="50"
                    alt="Orange Money"
                  />
                </div>
                <div>
                  <Image
                    src="/mtn-money.png"
                    width="50"
                    height="50"
                    alt="MTN Mobile Money"
                  />
                </div>
                <div>
                  <Image
                    src="/moov-money-2.png"
                    width="50"
                    height="50"
                    alt="Moov Money"
                  />
                </div>
                <div>
                  <Image src="/wave.png" width="50" height="50" alt="Wave" />
                </div>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle> </CardTitle>
                <CardDescription>
                  Remplissez le formulaire ci-dessous puis procédez au paiement.
                  <br /> Profitez de 6 mois d&apos;accès à tous nos contenus
                  digitaux pour <strong>20000 F CFA</strong>.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="text-gray-400 my-8 pl-10">
                    <div className="my-8">
                      <input
                        type="text"
                        name="customer_name"
                        placeholder="Nom"
                        className="w-1/2 p-3 rounded-md bg-zinc-200"
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
                        className="w-1/2 p-3 rounded-md bg-zinc-200"
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
                        className="w-1/2 p-3 rounded-md bg-zinc-200"
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
                        className="w-1/2 p-3 rounded-md bg-zinc-200"
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
                        className="w-1/2 p-3 rounded-md bg-zinc-200"
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
                        className="w-1/2 p-3 rounded-md bg-zinc-200"
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
                        className="w-1/2 p-3 rounded-md bg-zinc-200"
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
                        className="w-1/2 p-3 rounded-md bg-zinc-200"
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
                        className="w-1/2 p-3 rounded-md bg-zinc-200"
                        value={formData.customer_zip_code}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="flex justify-center">
                      <Button type="submit">Procéder au paiement</Button>
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <p></p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaiementSemestriel;
