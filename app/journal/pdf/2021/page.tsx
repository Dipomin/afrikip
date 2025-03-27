import { db } from "../../../../firebase";
import { FileType } from "../../../../typings";
import { collection, getDocs } from "firebase/firestore";
import React from "react";
import { getSession } from "../../../supabase-server";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import TableWrapperUser from "./TableWrapperUser";
import ArchivesAnnees from "../../../../components/archives-annees";

async function Dashboard() {
  const session = await getSession();
  const user = session?.user;
  //const userId = user?.id;

  //console.log(user);

  const docsResults = await getDocs(collection(db, "archives", "pdf", "2021"));
  const skeletonFiles: FileType[] = docsResults.docs.map((doc) => ({
    id: doc.id,
    filename: doc.data().filename || doc.id,
    timestamp: new Date(doc.data().timestamp?.seconds * 1000) || undefined,
    fullName: doc.data().fullName,
    downloadURL: doc.data().downloadURL,
    type: doc.data().type,
    size: doc.data().size,
  }));

  return user ? (
    <div className="border-t">
      <section className="container space-y-5">
        <div className="pt-5">
          <ArchivesAnnees />
        </div>
        <h2 className="text-2xl font-bold text-center pt-10">
          Archives 2021 des parutions de l&apos;Intelligent d&apos;Abidjan -
          Version numérique
        </h2>
        <div>
          <TableWrapperUser skeletonFiles={skeletonFiles} />
        </div>
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
