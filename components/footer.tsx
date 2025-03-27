import Link from "next/link";
import Container from "./container";
import Image from "next/image";

const footerData = [
  {
    text: "Qui sommes-nous",
    lien: "/a-propos/qui-sommes-nous",
  },
  {
    text: "Contacts",
    lien: "/a-propos/contacts",
  },
  {
    text: "Abonnement",
    lien: "/abonnement",
  },
  {
    text: "Conditions Générales d'Utilisation",
    lien: "/a-propos/cgu",
  },
  {
    text: "Foire aux questions",
    lien: "/a-propos/faq",
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-accent-1 border-t border-accent-2">
      <Container>
        <div className="py-12 flex flex-col lg:flex-row items-center">
          <h3 className="w-36 leading-tight text-center mb-10 lg:mb-0 lg:pr-4 lg:w-1/2">
            <Link href="/">
              <Image
                src="/images/afriki.png"
                width="300"
                height="100"
                alt="Afrikipresse"
                className="w-36"
              />
            </Link>
          </h3>
          <div className="flex flex-col lg:flex-row justify-center items-center lg:pl-4 lg:w-3/4">
            {footerData.map((footerInfo) => (
              <li key={footerInfo.lien} className=" mx-2 hover:underline flex">
                <Link href={footerInfo.lien} className=" text-sm text-center">
                  {footerInfo.text}
                </Link>
              </li>
            ))}
          </div>
        </div>
        <div>
          © 2014 Afrikipresse Multimédias Communication - Afrikipresse |
          Actualité africaine et internationale.
        </div>
      </Container>
    </footer>
  );
}
