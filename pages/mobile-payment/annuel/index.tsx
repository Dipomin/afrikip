"use client";

import React, { useState } from "react";
import axios, { AxiosResponse } from "axios";

import Image from "next/image";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../@/components/ui/card";
import { Input } from "../../../@/components/ui/input";
import Layout from "../../../components/layout";
import { useRouter } from "next/router";
import Link from "next/link";

interface ApiResponse {
  payment_url: string;
}

const PaiementAnnuel = () => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const randomCustomerId = BigInt(
    Math.floor(Math.random() * 100000000).toString()
  );
  const randomTransactionId = BigInt(
    Math.floor(Math.random() * 100000000).toString()
  );

  const [formData, setFormData] = useState({
    amount: 13000,
    currency: "XOF",
    alternative_currency: "",
    transaction_id: Number(randomTransactionId),
    customer_id: Number(randomCustomerId),
    description: " Abonnement annuel à Afrikipresse ",
    customer_name: "",
    customer_surname: "",
    customer_email: "",
    customer_phone_number: "",
    customer_address: "",
    customer_city: "",
    customer_country: "",
    customer_state: "",
    customer_zip_code: "",
    notify_url:
      "https://www.afrikipresse.fr/mobile-payment/checkpayment-a/notify",
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
          "/api/cinetpay-a",
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
    <Layout>
      <div className="bg-gray-500">
        <div className="grid justify-items-center">
          <div>
            <h1 className="text-white text-4xl font-bold text-center pt-5">
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
                  <br /> Profitez de 1 année d&apos;accès à tous nos contenus
                  digitaux pour <strong>40000 F CFA</strong>.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="text-gray-400 my-8 pl-10">
                    <div className="my-8">
                      <Input
                        type="text"
                        name="customer_name"
                        placeholder="Nom"
                        className="w-full p-3 rounded-md bg-zinc-200"
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
                        className="w-full p-3 rounded-md bg-zinc-200"
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
                        className="w-full p-3 rounded-md bg-zinc-200"
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
                        className="w-full p-3 rounded-md bg-zinc-200"
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
                        className="w-full p-3 rounded-md bg-zinc-200"
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
                        className="w-full p-3 rounded-md bg-zinc-200"
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
                        className="w-full p-3 rounded-md bg-zinc-200"
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

export default PaiementAnnuel;
