"use client";

import { Montserrat } from "next/font/google";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "../lib/utils";
import { useEffect, useState } from "react";

const montserrat = Montserrat({ weight: "800", subsets: ["latin"] });

const menus = [
  {
    label: "Politique",
    href: "/categorie/politique",
  },
  {
    label: "Société",
    href: "/categorie/societe",
  },
  {
    label: "Economie",
    href: "/categorie/economie",
  },
  {
    label: "SPort",
    href: "/categorie/sport",
  },
  {
    label: "Culture",
    href: "/categorie/culture",
  },
  {
    label: "Afrique",
    href: "/categorie/afrique",
  },
  {
    label: "International",
    href: "/categorie/international",
  },
  {
    label: "Opinion",
    href: "/categorie/opinion",
  },
];

const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <nav className={montserrat.className}>
      <div className="space-y-3 py-2 overflow-x-auto justify-start lg:justify-center flex bg-white text-black border-t-4 border-b-[1px] border-b-gray-200 border-red-600">
        <div className="lg:px-3 py-2">
          <div className="flex lg:flex lg:flex-row md:flex ">
            {menus.map((menu) => (
              <div
                key={menu.href}
                onClick={() => {
                  router.push(menu.href);
                }}
                className={cn(
                  "text-xl group flex items-center lg:p-3 w-full justify-start font-medium cursor-pointer hover:text-blue-900 hover:bg-white/10 rounded-lg transition",
                  pathname === menu.href ? "text-red-600 " : "text-black"
                )}
              >
                <div className="flex text-sm mx-3 lg:text-xl uppercase items-center">
                  {menu.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
