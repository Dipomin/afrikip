import { Inter, Roboto } from "next/font/google";
import Footer from "./footer";

export const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function Layout({ preview, children }) {
  return (
    <>
      <div className="min-h-screen bg-[#f5f6f8]">
        {/* <Alert preview={preview} /> */}
        <main className={roboto.className}>{children}</main>
      </div>
      <Footer />
    </>
  );
}
