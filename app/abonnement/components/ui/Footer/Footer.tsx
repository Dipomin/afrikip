import Link from "next/link";

import Logo from "../../../../../components/Logo";

export default function Footer() {
  return (
    <footer className="mx-auto max-w-[1920px] px-6 bg-zinc-900 text-xs">
      <div className="grid grid-cols-1 gap-8 py-12 text-white transition-colors duration-150 border-b lg:grid-cols-12 border-zinc-600 bg-zinc-900">
        <div className="col-span-1 lg:col-span-2">
          <ul className="flex flex-col flex-initial md:flex-1">
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/"
                className="text-white transition duration-150 ease-in-out hover:text-zinc-200"
              >
                Accueil
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/a-propos/contacts"
                className="text-white transition duration-150 ease-in-out hover:text-zinc-200"
              >
                À propos
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/a-propos/cgu"
                className="text-white transition duration-150 ease-in-out hover:text-zinc-200"
              >
                Conditions générales d&apos;utilisation
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/a-propos/faq"
                className="text-white transition duration-150 ease-in-out hover:text-zinc-200"
              >
                FAQ
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <ul className="flex flex-col flex-initial md:flex-1">
            <li className="py-3 md:py-0 md:pb-4">
              <p className="font-bold text-white transition duration-150 ease-in-out hover:text-zinc-200">
                Données personnelles
              </p>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/"
                className="text-white transition duration-150 ease-in-out hover:text-zinc-200"
              >
                Politique de Confidentialité
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/a-propos/contacts"
                className="text-white transition duration-150 ease-in-out hover:text-zinc-200"
              >
                Contacts
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between py-12 space-y-4 md:flex-row bg-zinc-900">
        <div>
          <span>
            &copy; {new Date().getFullYear()} Afrikipresse, Tous droits
            réservés.
          </span>
        </div>
      </div>
    </footer>
  );
}
