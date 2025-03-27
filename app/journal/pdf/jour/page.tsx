import { db } from "../../../../firebase";
import { FileType } from "../../../../typings";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { getSession } from "../../../supabase-server";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import TableWrapperUser from "./TableWrapperUser";
import { ArrowRight, StopCircleIcon } from "lucide-react";
import ArchivesAnnees from "../../../../components/archives-annees";
import Image from "next/image";

async function Dashboard() {
  const session = await getSession();
  const user = session?.user;
  const userId = user?.id;

  //console.log(user);
  /**
  const collectionRef = collection(db, "archives", "pdf", "2021");
  const q = query(collectionRef, orderBy("timestamp", "desc"), limit(1));
  const docsResults = await getDocs(q);
*/

  const q = query(
    collection(db, "archives", "pdf", "2023"),
    (orderBy("timestamp", "desc"), limit(7))
  );

  const docsResults = await getDocs(q);

  //console.log("RÃ©sultats", docsResults);

  const skeletonFiles: FileType[] = docsResults.docs.map((doc) => ({
    id: doc.id,
    filename: doc.data().filename || doc.id,
    timestamp: new Date(doc.data().timestamp?.seconds * 1000) || undefined,
    fullName: doc.data().fullName,
    downloadURL: doc.data().downloadURL,
    type: doc.data().type,
    size: doc.data().size,
  }));
  //console.log("Docs results recupÃ©rÃ©s", skeletonFiles);
  //console.log("Skeleton Files recupÃ©rÃ©s", skeletonFiles);

  return user ? (
    <div className="border-t">
      <section className="container space-y-5">
        <div className="pt-10">
          <ArchivesAnnees />
        </div>
        <h2 className=" text-2xl lg:text-4xl font-bold text-center pt-10 font-serif">
          Parution du jour de l&apos;Intelligent d&apos;Abidjan n°17 • Spécial
          CAN 2023 <br /> Version numérique
        </h2>
        <div className="flex justify-center my-5">
          <Link href="/parutions/Special_CAN_Numero_5.pdf">
            <Image
              src={"/parutions/cover-5349.png"}
              width={250}
              height={450}
              alt="L'intelligent d'Abidjan"
              className="flex justify-center pb-5"
            />
            <button className="flex justify-center font-bold p-4 bg-blue-900 text-white hover:bg-gray-600  hover:animate-pulse">
              <span>Lire</span> <ArrowRight />
            </button>
          </Link>
        </div>
        <div>
          <TableWrapperUser skeletonFiles={skeletonFiles} />
        </div>
      </section>
    </div>
  ) : (
    <div>
      <div className="text-2xl font-bold text-center pt-10">
        <StopCircleIcon />
        Désolé Vous n&apos;êtes pas connecté ou vous ne disposez pas d&apos;un
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
