import Footer from "./footer";
import { Roboto, Kanit, Montserrat } from "next/font/google";
import NavBar from "./navbar";
import ToasterProvider from "../providers/ToasterProvider";
import Link from "next/link";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { LogInIcon, LogOutIcon, Search, User2 } from "lucide-react";
import { useState } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import ArticleSearch from "./article-search";
import { Toaster } from "./ui/toaster";
import { Button } from "./ui/button";

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

export default function Layout({ preview, children, user }) {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();

  const handleLogout = async () => {
    const { error } = await supabaseClient.auth.signOut();
    router.refresh();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Vous avez été deconnecté");
    }
  };

  const [statusAbonne, setStatusAbonne] = useState<string | undefined | null>(
    null
  );
  const [recherche, setRecherche] = useState(false);

  return (
    <>
      <ToasterProvider />
      <SpeedInsights />
      <GoogleAnalytics gaId="G-371522159" />
      <div className="min-h-screen lg:bg-[#f5f6f8] bg-white">
        <section className="pb-3 md:flex-row items-center md:justify-between mt-8 md:mb-12 bg-white">
          <div className="flex justify-center space-x-4 lg:space-x-16 items-center leading-tight md:pr-8">
            <div className="hidden lg:flex space-x-2">
              {user ? (
                <div
                  onClick={() => router.push("/lintelligentpdf/aujourdhui")}
                  className="flex gap-3 cursor-pointer"
                >
                  <div className="w-20">
                    <Image
                      src={"https://www.afrikipresse.fr/journal-lia.png"}
                      width={180}
                      height={117}
                      alt="L'intelligent d'Abidjan"
                    />
                  </div>

                  <div className=" hover:underline hover:text-red-700 pt-3 font-bold text-red-500">
                    Lire le journal
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => router.push("/signin")}
                  className="flex gap-3 cursor-pointer align-middle"
                >
                  <div className="w-20 border-2">
                    <Image
                      src={"https://www.afrikipresse.fr/journal-lia.png"}
                      width={180}
                      height={117}
                      alt="L'intelligent d'Abidjan"
                    />
                  </div>
                  <span className=" hover:underline hover:text-red-600 pt-3">
                    Lire le journal
                  </span>
                </div>
              )}
            </div>
            <div className=" w-[150]">
              <Link href="/">
                <Image
                  src="https://www.afrikipresse.fr/images/afriki.png"
                  width="300"
                  height="100"
                  alt="Afrikipresse"
                  className="w-[250]"
                />
              </Link>
            </div>
            <div className="flex space-x-3 items-end justify-end">
              <div>
                {user ? (
                  <div className="hidden lg:flex space-x-2">
                    <button
                      onClick={() => router.push("/account")}
                      className="bg-black hover:bg-red-600 p-3 text-white font-bold rounded-sm mx-3"
                    >
                      Mon compte
                    </button>
                  </div>
                ) : (
                  <div className="hidden lg:flex space-x-2">
                    <button
                      onClick={() => router.push("/abonnement")}
                      className="bg-red-500 hover:bg-red-600 p-3 text-white font-bold rounded-sm mx-3"
                    >
                      S&apos;abonner dès 5€
                    </button>
                  </div>
                )}
              </div>
              <div>
                {user ? (
                  <div>
                    <div className="flex mx-4 hidden lg:block">
                      <Button
                        onClick={handleLogout}
                        className="bg-black hover:bg-red-600 p-3 text-white font-bold rounded-sm mx-3"
                      >
                        Se déconnecter
                      </Button>
                      <Button onClick={() => setRecherche(true)}>
                        <Search size={36} />
                      </Button>
                    </div>

                    <div className="flex mx-2 lg:hidden">
                      <div>
                        <Button
                          onClick={() => router.push("/account")}
                          className="bg-black hover:bg-red-600 p-1 text-white font-bold rounded-sm mx-3"
                        >
                          <User2 width={20} height={20} />
                        </Button>
                      </div>
                      <div>
                        <Button
                          onClick={handleLogout}
                          className="bg-black hover:bg-red-600 p-1 text-white font-bold rounded-sm mx-3"
                        >
                          <LogOutIcon width={20} height={20} />
                        </Button>
                      </div>
                      <Button onClick={() => setRecherche(true)}>
                        <Search size={36} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex pt-2">
                    <div className="lg:hidden">
                      <Link href="/abonnement">
                        <Button className="bg-red-600 text-white p-2">
                          S&apos;abonner
                        </Button>
                      </Link>
                    </div>
                    <div>
                      <Link href="/signin">
                        <Button className="bg-black hidden lg:block lg:text-14 hover:bg-red-600 p-1 lg:p-3 text-white font-bold rounded-sm mx-3">
                          Se connecter
                        </Button>
                        <div className="bg-black block lg:hidden lg:text-14 hover:bg-red-600 p-2 lg:p-3 text-white font-bold rounded-sm mx-3">
                          <LogInIcon />
                        </div>
                      </Link>
                    </div>
                    <Button onClick={() => setRecherche(true)}>
                      <Search size={36} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        <div className="flex justify-center">
          {recherche && <ArticleSearch />}
        </div>
        <NavBar />
        <Toaster />
        <main className={roboto.className}>{children}</main>
      </div>
      <Footer />
    </>
  );
}
