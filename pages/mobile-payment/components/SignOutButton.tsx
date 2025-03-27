"use client";

import { useRouter } from "next/navigation";

import s from "./Navbar.module.css";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../../../types_db";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return (
    <button
      className={s.link}
      onClick={async () => {
        await supabase.auth.signOut();
        router.push("/signin");
      }}
    >
      Déconnexion
    </button>
  );
}
