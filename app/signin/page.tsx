//"use client";

import { getSession } from "../supabase-server";
import AuthUI from "./AuthUI";

import { redirect } from "next/navigation";

export default async function SignIn() {
  const isClient = typeof window !== "undefined";

  if (isClient) {
    const session = await getSession();

    if (session) {
      redirect("/account");
    }
  }

  return (
    <div className="flex justify-center height-screen-helper">
      <div className="flex flex-col justify-between max-w-lg p-3 m-auto w-80 ">
        <div className="flex flex-col justify-center pb-12 ">
          <div className="flex justify-center pt-5">
            <span className="text-lg text-center font-bold text-black uppercase">
              Connexion à votre compte
            </span>
          </div>
        </div>
        <AuthUI />
      </div>
    </div>
  );
}
