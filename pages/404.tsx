import Link from "next/link";
import Button from "../components/button";
import Layout from "../components/layout";
import { ArrowLeft } from "lucide-react";

export default function Custom404() {
  return (
    <div>
      <Layout>
        <div className="w-screen h-screen">
          <h1 className="text-3xl text-red-600 text-center p-10">
            404 - La Page que vous recherchez est introuvable
          </h1>
          <Link href="/" className="flex justify-center">
            <Button>
              <span className="flex gap-2">
                <ArrowLeft /> Retourner à la page d'accueil
              </span>
            </Button>
          </Link>
        </div>
      </Layout>
    </div>
  );
}
