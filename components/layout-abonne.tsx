import Footer from "./footer";
import { Roboto, Kanit, Montserrat } from "next/font/google";
import NavbarAbonne from "./navbar-abonne";

export const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const kanit = Kanit({
  weight: "600",
  subsets: ["latin"],
  display: "swap",
});

export const montserrat = Montserrat({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const dynamic = "force-dynamic";

export default function LayoutAbonne({ children }) {
  return (
    <>
      <div className="min-h-screen lg:bg-[#f5f6f8] bg-white">
        <div className=" ">
          <div>
            <NavbarAbonne />
          </div>
        </div>
        <main className={roboto.className}>{children}</main>
      </div>
      <Footer />
    </>
  );
}
