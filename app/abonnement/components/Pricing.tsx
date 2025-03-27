"use client";

import Button from "./ui/Button";
import { Database } from "../../../types_db";
import { postData } from "../../../utils/helpers";
import { getStripe } from "../../../utils/stripe-client";
import { Session, User } from "@supabase/supabase-js";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Gauge, Info, Newspaper, ShieldCheck } from "lucide-react";
import Logo from "../../../components/Logo";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
type Product = Database["public"]["Tables"]["products"]["Row"];
type Price = Database["public"]["Tables"]["prices"]["Row"];
interface ProductWithPrice extends Product {
  prices?: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices?: PriceWithProduct | null;
}

interface Props {
  session: Session | null;
  user: User | null | undefined;
  products: ProductWithPrice[];
  subscription: SubscriptionWithProduct | null;
}

const abonnementsMobile = [
  {
    id: "1",
    duree: "mois",
    description: "Accédez à tous nos contenus numériques durant 1 mois.",
    montant: "2000 F CFA",
    lien: "https://checkout.cinetpay.com/payment/0f0613057aff6646fac7358f5047c0527507560bca3cd91172c69e97ac478f22351e385e29f4d5529f471ddb58a5ece61a6524baff0c92#!",
  },
  {
    id: "2",
    duree: "6 mois",
    description: "Accédez à tous nos contenus numériques durant 6 mois.",
    montant: "6500 F CFA",
    lien: "https://checkout.cinetpay.com/payment/75ef2262a114709dbf6f8bc1cd8bc912e1651d0ae72096c97aa94f7be61721848b56eddcc4f2982968e721cffd5c5dd12075d65ca5c853#!",
  },
  {
    id: "3",
    duree: "12 mois",
    description: "Accédez à tous nos contenus numériques durant 12 mois.",
    montant: "13000 F CFA",
    lien: "https://checkout.cinetpay.com/payment/1675221bf4236b686b581495de729d0f8f450bdac2c60186c8eee19f47d3a1ab4c09dd65f9aa1f34a71b1aadb1dc5f2f12d01851ce95f8#!",
  },
];

type BillingInterval = "lifetime" | "year" | "month";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

export default function Pricing({
  session,
  user,
  products,
  subscription,
}: Props) {
  const router = useRouter();
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("month");
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const theme = useTheme();
  const [value, setValue] = React.useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  if (!products) {
    return <div>Chargement en cours...</div>;
  }

  const intervals = Array.from(
    new Set(
      products.flatMap((product) =>
        product?.prices?.map((price) => price?.interval)
      )
    )
  );

  const handleCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);
    if (!user) {
      return router.push("/signin");
    }
    if (subscription) {
      return router.push("/account");
    }
    try {
      const { sessionId } = await postData({
        url: "/api/create-checkout-session",
        data: { price },
      });

      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      return alert((error as Error)?.message);
    } finally {
      setPriceIdLoading(undefined);
    }
  };

  const handleCheckoutMobileMois = async () => {
    if (!user) {
      return router.push("/signin");
    }
    if (user) {
      return router.push("/account");
    }
    try {
      redirect(abonnementsMobile[4].lien);
    } catch (error) {
      return alert((error as Error)?.message);
    }
  };

  return (
    <section className="bg-white">
      <div className="max-w-6xl px-4 py-8 mx-auto sm:py-24 sm:px-6 lg:px-8">
        <div className="sm:flex sm:flex-col sm:align-center my-4">
          <h1 className="text-4xl text-center font-extrabold text-black sm:text-center sm:text-6xl">
            Accédez à tous nos contenus
          </h1>
          <p className="max-w-2xl m-auto text-center mt-5 text-xl text-zinc-400 sm:text-center sm:text-2xl">
            Articles exclusifs, analyses politiques, reportages, brèves,
            journaux au format numériques, ...
          </p>
          <div>
            <div className="relative flex hidden self-center mt-12 rounded-lg bg-zinc-200 border-zinc-400">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border border-black divide-y rounded-lg shadow-sm bg-zinc-200 divide-zinc-600"
                >
                  <div className="p-6 py-2 m-1 text-2xl font-bold uppercase text-black rounded-md shadow-sm border-zinc-800 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 focus:z-10 sm:w-auto sm:px-8">
                    {product.name}
                  </div>
                  <div className="p-3 text-center">{product.description}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Box sx={{ bgcolor: "background.paper", width: 900 }}>
                <AppBar position="static">
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="secondary"
                    textColor="inherit"
                    variant="fullWidth"
                    aria-label="full width tabs example"
                  >
                    <Tab label="Carte Bancaire (Euros)" {...a11yProps(0)} />
                    <Tab label="Mobile Money (F CFA)" {...a11yProps(1)} />
                  </Tabs>
                </AppBar>

                <TabPanel value={value} index={0}>
                  <div className="mt-6 space-y-4 sm:mt-12 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="divide-y rounded-lg shadow-sm divide-zinc-600 bg-zinc-200 text-center"
                      >
                        {product.prices?.map((price) => {
                          const priceString =
                            price.unit_amount &&
                            new Intl.NumberFormat("fr-FR", {
                              style: "currency",
                              currency: price.currency!,
                              minimumFractionDigits: 0,
                            }).format(price.unit_amount / 100);

                          return (
                            <div key={price.interval} className="p-6">
                              <p>
                                <span className="text-3xl font-extrabold white">
                                  {priceString}
                                </span>
                                <span className="text-base font-medium text-black">
                                  /{price.interval}
                                </span>
                              </p>
                              <p className=" lg:font-black text-xl pt-5">
                                {product.description}
                              </p>
                              <p className="mt-4 text-black ">
                                {price.description}
                              </p>
                              <Button
                                variant="slim"
                                type="button"
                                disabled={false}
                                loading={priceIdLoading === price.id}
                                onClick={() => handleCheckout(price)}
                                className="block w-full py-2 mt-12 text-sm font-semibold text-center bg-red-700 text-white rounded-md hover:bg-red-500"
                              >
                                {product.name ===
                                subscription?.prices?.products?.name
                                  ? "Gérer"
                                  : "S'abonner"}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </TabPanel>
                <TabPanel value={value} index={1}>
                  <div className="mt-6 space-y-4 sm:mt-12 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
                    {abonnementsMobile.map((abonnement) => (
                      <div
                        key={abonnement.id}
                        className="divide-y rounded-lg shadow-sm divide-zinc-600 bg-zinc-200 text-center"
                      >
                        {
                          <div key={abonnement.duree} className="p-6">
                            <p>
                              <span className="text-3xl font-extrabold white">
                                {abonnement.montant}
                              </span>

                              <span className="text-base font-medium text-black">
                                /{abonnement.duree}
                              </span>
                            </p>
                            <p className=" lg:font-black text-xl pt-5">
                              {abonnement.description}
                            </p>

                            <Button
                              variant="slim"
                              type="button"
                              disabled={false}
                              loading={priceIdLoading === abonnement.id}
                              onClick={() => {
                                session
                                  ? router.push(abonnement.lien)
                                  : router.push("/signin");
                              }}
                              className="block w-full py-2 mt-12 text-sm font-semibold text-center bg-red-700 text-white rounded-md hover:bg-red-500"
                            >
                              S&apos;abonner
                            </Button>
                          </div>
                        }
                      </div>
                    ))}
                  </div>
                </TabPanel>
              </Box>
            </div>
          </div>
        </div>
        <Avantages />
        <Payment />
      </div>
    </section>
  );
}

function Avantages() {
  return (
    <div className="lg:p-10 lg:border-[1px] rounded-sm">
      <div className="text-3xl uppercase text-center font-extrabold text-red-500 underline">
        Vos Avantages
      </div>
      <div className="lg:flex items-center justify-center mx-10 my-10">
        <div className="lg:w-[500px] lg:mx-8">
          <div className="flex items-center justify-center text-center lg:justify-start ">
            <Info size={36} color="red" />
          </div>
          <div className="text-2xl text-zinc-400 font-black text-center lg:text-left p-3">
            Articles en exclusivités
          </div>
          <div className="text-center text-zinc-500 lg:text-left">
            Bénéficiez d&apos;un accès illimité à l&apos;ensemble du contenu
            éditorial et savourez une information exhaustive ainsi qu&apos;une
            analyse de haute qualité chaque jour.
          </div>
        </div>
        <div className="lg:w-[500px] lg:mx-8 my-5">
          <div className="flex items-center justify-center text-center lg:justify-start">
            {" "}
            <Newspaper size={36} color="red" />{" "}
          </div>
          <div className="text-2xl text-zinc-400 font-black text-center lg:text-left p-3">
            Journal version numérique
          </div>
          <div className="text-center text-zinc-500 lg:text-left">
            Obtenez quotidiennement l&quotédition numérique de notre journal
            papier L&apos;Intelligent d&apos;Abidjan.
          </div>
        </div>
        <div className="lg:w-[500px] lg:mx-8">
          <div className="flex items-center justify-center text-center lg:justify-start">
            <Gauge size={36} color="red" />
          </div>
          <div className="text-2xl text-zinc-400 font-black text-center lg:text-left p-3">
            Brèves actualités du moment
          </div>
          <div className="text-center text-zinc-500 lg:text-left">
            Recevez quotidiennement et en exclusivité un condensé de
            l&apos;actualité du jour.
          </div>
        </div>
      </div>
    </div>
  );
}

function Payment() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex text-black font-extrabold p-5 gap-x-3">
        <div>
          <ShieldCheck />
        </div>
        <div>Paiements sécurisés</div>
      </div>
      <div className="flex gap-x-3 bg-white p-3">
        <div className="w-16">
          <Image
            src="/logo-visa.webp"
            width="106"
            height="33"
            alt="Visa"
            className="w-16"
          />
        </div>
        <div className="w-9">
          <Image
            src="/logo-mastercard.webp"
            width="97"
            height="75"
            alt="Visa"
            className="w-9"
          />
        </div>
      </div>
    </div>
  );
}
