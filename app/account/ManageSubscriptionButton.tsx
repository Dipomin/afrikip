"use client";

import Button from "../abonnement/components/ui/Button";
import { postData } from "../../utils/helpers";

import { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Props {
  session: Session;
}

export default function ManageSubscriptionButton({ session }: Props) {
  const router = useRouter();
  const redirectToCustomerPortal = async () => {
    try {
      const { url } = await postData({
        url: "/api/create-portal-link",
      });
      router.push(url);
    } catch (error) {
      if (error) return alert((error as Error).message);
    }
  };

  return (
    <div>
      <p className="pb-4 sm:pb-5">Modifier mon abonnement</p>
      <div className="flex items-start justify-between sm:flex-row sm:items-center">
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
        <div className="w-16">
          <Image
            src="/logo-paypal.webp"
            width="106"
            height="33"
            alt="Visa"
            className="w-16"
          />
        </div>
        <div>
          <Button
            variant="slim"
            disabled={!session}
            onClick={redirectToCustomerPortal}
          >
            Modifier
          </Button>
        </div>
      </div>
    </div>
  );
}
