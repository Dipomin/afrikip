import { AppProps } from "next/app";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import "../styles/index.css";
import Script from "next/script";
import { useState } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { GoogleAnalytics } from "@next/third-parties/google";
import Modal from "react-modal";

function MyApp({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  Modal.setAppElement("#__next");

  return (
    <>
      <script src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3317567731429125" />
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <Component {...pageProps} />
        <GoogleAnalytics gaId="G-371522159" />
      </SessionContextProvider>
    </>
  );
}

export default MyApp;
