import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ThemeToggle } from "./ThemeToggler";

export default function Header() {
  return (
    <header className="flex items-center justify-between">
      <Link href="/">
        <div className="bg-[#0160FE] w-fit">
          <Image
            src="https://www.shareicon.net/download/2016/07/13/606936_dropbox_2048x2048.png"
            alt="Logo"
            className="invert"
            height={50}
            width={50}
          />
        </div>
      </Link>

      <div className="px-5 flex space-x-2 items-center">
        <ThemeToggle />
      </div>
    </header>
  );
}
