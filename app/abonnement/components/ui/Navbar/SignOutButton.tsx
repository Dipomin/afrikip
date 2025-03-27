"use client";

import { useSupabase } from "../../../../supabase-provider";
import { useRouter } from "next/navigation";

import s from "./Navbar.module.css";
import { LogOutIcon } from "lucide-react";

export default function SignOutButton() {
  const router = useRouter();
  const { supabase } = useSupabase();

  return (
    <button
      className={s.link}
      onClick={async () => {
        await supabase.auth.signOut();
        router.push("/signin");
      }}
    >
      <div className="hidden lg:block">Déconnexion</div>
      <div className="">
        <LogOutIcon />
      </div>
    </button>
  );
}
