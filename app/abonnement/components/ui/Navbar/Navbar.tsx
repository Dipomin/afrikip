import Link from "next/link";
import { createServerSupabaseClient } from "../../../../supabase-server";
import SignOutButton from "./SignOutButton";

import s from "./Navbar.module.css";
import { User2 } from "lucide-react";

export default async function Navbar({ userId }) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className={s.root}>
      <div className="max-w-6xl px-6 mx-auto pt-3">
        <div className="flex justify-start ml-6 space-x-2 ">
          <div className="flex justify-center">
            <Link href="/" className={s.logo} aria-label="Logo">
              <img
                src="https://www.afrikipresse.fr/images/afrikipresse.png"
                width={200}
                height={30}
                className=" "
              />
            </Link>
          </div>
          <div className="flex justify-end flex-1 space-x-8">
            <div className="flex">
              {user && (
                <Link href="/account" className={s.link}>
                  <div className="hidden lg:block">Mon Compte</div>
                  <div className=" block lg:hidden">
                    {" "}
                    <User2 />
                  </div>
                </Link>
              )}
            </div>
            {user ? (
              <div>
                <SignOutButton />
              </div>
            ) : (
              <Link href="/signin" className={s.link}>
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
