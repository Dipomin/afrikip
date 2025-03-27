"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import axios, { AxiosResponse } from "axios";
import { createClient } from "@supabase/supabase-js";

import { Database } from "../../../types_db";
import { useSession } from "@supabase/auth-helpers-react";
import Image from "next/image";
import Button from "../../../app/abonnement/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../@/components/ui/card";
import LayoutAbonne from "../../../components/layout-abonne";
import Layout from "../../../components/layout";
import { Input } from "../../../@/components/ui/input";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

interface ApiResponse {
  payment_url: string;
}

const PaiementMensuel = () => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const session = useSession();

  const user = session?.user;

  const randomTransactionId = BigInt(
    Math.floor(Math.random() * 100000000).toString()
  );
  const randomCustomerId = BigInt(
    Math.floor(Math.random() * 100000000).toString()
  );

  const [formData, setFormData] = useState({
    amount: 2000,
    currency: "XOF",
    alternative_currency: "",
    description: "Abonnement mensuel à Afrikipresse",
    transaction_id: Number(randomTransactionId),
    customer_id: Number(randomCustomerId),
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
      // Insérez les données du formulaire dans la table mobilepayment de Supabase
      const { data, error } = await supabase
        .from("mobilepayment")
        .upsert([formData]);

      if (error) {
        throw error;
      } else {
        try {
          const response: AxiosResponse<ApiResponse> = await axios.post(
            "/api/cinetpay-m",
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
                  Remplissez le formulaire ci-dessous puis procédez au paiement.{" "}
                  <br /> Profitez de 30 jours d&apos;accès à tous nos contenus
                  digitaux pour <strong> 2000 F CFA</strong>.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="text-gray-400 flex flex-col justify-center">
                    <div className="my-8">
                      <Input
                        type="text"
                        name="customer_name"
                        placeholder="Nom"
                        className="p-3 rounded-md bg-zinc-200"
                        value={formData.customer_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="my-8">
                      <Input
                        type="text"
                        name="customer_surname"
                        placeholder="Prénoms"
                        className=" p-3 rounded-md bg-zinc-200"
                        value={formData.customer_surname}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="my-8">
                      <Input
                        type="text"
                        name="customer_email"
                        placeholder="Adresse email"
                        className="p-3 rounded-md bg-zinc-200"
                        value={formData.customer_email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="my-8">
                      <Input
                        type="text"
                        name="customer_phone_number"
                        placeholder="Numéro de téléphone"
                        className="p-3 rounded-md bg-zinc-200"
                        value={formData.customer_phone_number}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="my-8">
                      <Input
                        type="text"
                        name="customer_address"
                        placeholder="Adresse"
                        className="p-3 rounded-md bg-zinc-200"
                        value={formData.customer_address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="my-8">
                      <Input
                        type="text"
                        name="customer_city"
                        placeholder="Ville"
                        className="p-3 rounded-md bg-zinc-200"
                        value={formData.customer_city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="my-8">
                      <Input
                        type="text"
                        name="customer_country"
                        placeholder="Pays"
                        className="p-3 rounded-md bg-zinc-200"
                        value={formData.customer_country}
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

export default PaiementMensuel;
