import Link from "next/link";
import React from "react";
import Button from "../button";

const WallAbonnes = () => {
  return (
    <div className="w-full bg-slate-200 p-5 text-center">
      <div className="text-2xl text-black font-bold uppercase">
        La suite de l&apos;article est réservé aux abonnés.
      </div>
      <div className="text-gray-500">
        Vous êtes déjà abonné ?{" "}
        <Link href="/signin" className="underline hover:text-red-500">
          Connectez-vous
        </Link>{" "}
      </div>
      <div className="text-xl my-5 text-zinc-600">
        <h4>Accéder à tous nos contenus en vous abonnant maintenant.</h4>
      </div>

      <div className="p-5">
        <Link href="/abonnement/">
          <Button>S&apos;abonner</Button>
        </Link>
      </div>
    </div>
  );
};

export default WallAbonnes;
