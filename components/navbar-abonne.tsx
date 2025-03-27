import Link from "next/link";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
//import { useUser } from "../hooks/useUser";
import { FaUserAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import { getSession } from "../lib/supabase-server";

const NavbarAbonne = () => {
  const route = useRouter();
  const supabaseClient = useSupabaseClient();
  //const { user } = useUser();
  const session = getSession();

  const handleLogout = async () => {
    const { error } = await supabaseClient.auth.signOut();
    route.refresh();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Vous avez été deconnecté");
    }
  };

  return (
    <section className="pb-3 md:flex-row items-center md:justify-between mt-8 md:mb-12 bg-white">
      <div className="flex justify-center space-x-16 items-center leading-tight md:pr-8">
        <div className="hidden lg:flex space-x-2">
          <Link href="/abonnement">
            <button className="bg-black hover:bg-red-600 p-3 text-white font-bold rounded-sm mx-3">
              S&apos;abonner
            </button>
          </Link>
        </div>
        <div className="">
          <Link href="/">
            <Image
              src="/images/afriki.png"
              width="300"
              height="100"
              alt="Afrikipresse"
            />
          </Link>
        </div>
        <div className="flex space-x-3 items-end justify-end">
          <div>
            {
              <div>
                <div></div>

                <Link href="/signin">
                  <button className="bg-black hover:bg-red-600 p-3 text-white font-bold rounded-sm mx-3">
                    Se connecter
                  </button>
                </Link>
              </div>
            }

            {/**
            <button
              onClick={() => route.push("/abonnement")}
              className="bg-red-700 p-3 text-white rounded-full"
            >
                <FaUserAlt /> 
            </button>
            */}
          </div>
        </div>
      </div>
    </section>
  );
};
export default NavbarAbonne;
