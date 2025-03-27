import SupabaseProvider from "./supabase-provider";
import Footer from "./abonnement/components/ui/Footer";
import Navbar from "./abonnement/components/ui/Navbar";
import { PropsWithChildren } from "react";
import "../styles/main.css";
import Head from "next/head";
import { Toaster } from "./journal/components/ui/toaster";

export const dynamic = "force-dynamic";

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: PropsWithChildren) {
  return (
    <html lang="fr">
      <Head>
        <meta
          property="twitter:description"
          content="Suivez toute l'actualité africaine et dans le monde"
        />
        <meta
          property="description"
          content="Suivez toute l'actualité africaine et dans le monde"
        />
        <meta
          property="twitter:image"
          content="https://www.afrikipresse.com/default.png"
        />
        <meta property="twitter:title" content="Afrikipresse" />
        <meta property="twitter:url" content="https://www.afrikipresse.com" />
        <meta
          property="twitter:description"
          content="Suivez toute l'actualité africaine et dans le monde"
        />
        <meta
          property="description"
          content="Suivez toute l'actualité africaine et dans le monde"
        />
        <meta
          property="og:description"
          content="Suivez toute l'actualité africaine et dans le monde"
        />
        <meta property="og:url" content="https://www.afrikipresse.com" />
        <meta
          name="description"
          content="Suivez toute l'actualité africaine et dans le monde"
        />
        <title>Afrikipresse</title>
        <link rel="canonical" href="https://www.afrikipresse.com" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta
          name="msapplication-config"
          content="https://www.afrikipresse.com/favicon/browserconfig.xml"
        />
      </Head>
      <body className="bg-gray-400 loading">
        <SupabaseProvider>
          {/* @ts-ignore */}
          <Navbar />
          <Toaster />
          <main
            id="skip"
            className="min-h-[calc(100dvh-4rem)] md:min-h[calc(100dvh-5rem)]"
          >
            {children}
          </main>
          <Footer />
        </SupabaseProvider>
      </body>
    </html>
  );
}
