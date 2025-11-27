"use client";

import { useRouter } from "next/navigation";

import s from "./Navbar.module.css";


export default function SignOutButton() {
  const router = useRouter();

  return (
    <button
      className={s.link}
      onClick={async () => {
        router.push("/signin");
      }}
    >
      Déconnexion
    </button>
  );
}
