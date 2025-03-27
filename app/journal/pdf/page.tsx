import React from "react";
import { getSession } from "../../supabase-server";
import Link from "next/link";
import { Button } from "../components/ui/button";
import Image from "next/image";
import ArchivesAnnees from "../../../components/archives-annees";
import { redirect } from "next/navigation";

async function Dashboard() {
  const session = await getSession();
  const user = session?.user;
  const userId = user?.id;

  return user ? (
    <div className="border-t">
      <section className="container space-y-5">
        <h2 className="text-2xl font-bold text-center pt-10">
          Archives des parutions de l&apos;Intelligent d&apos;Abidjan - Version
          numérique
        </h2>
        <div className="flex justify-center">
          <Image
            alt="L'intelligent d'Abidjan"
            width={300}
            height={500}
            src={"/special-can-012.png"}
            className=" border-8 shadow-md"
          />
        </div>
        <ArchivesAnnees />
      </section>
    </div>
  ) : (
    <div>
      <div className="text-2xl font-bold text-center pt-10">
        Désolé! Vous n&apos;êtes pas connecté ou vous ne disposez pas d&apos;un
        abonnement actif à nos contenus numériques.
      </div>
      <div className="flex justify-center pt-10">
        <Link href="/">
          <Button>Retourner</Button>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
