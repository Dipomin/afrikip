import { db } from "../../../../../firebase";

// Force dynamic rendering - Firebase data cannot be prerendered
export const dynamic = "force-dynamic";
import { FileType } from "../../../../../typings";

// Force dynamic rendering - Firebase data cannot be prerendered
export const dynamic = "force-dynamic";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";

// Force dynamic rendering - Firebase data cannot be prerendered
export const dynamic = "force-dynamic";
import React, { useEffect, useState } from "react";

// Force dynamic rendering - Firebase data cannot be prerendered
export const dynamic = "force-dynamic";

import Link from "next/link";

// Force dynamic rendering - Firebase data cannot be prerendered
export const dynamic = "force-dynamic";
import { Button } from "../../../../../components/admin-journal/ui/button";

// Force dynamic rendering - Firebase data cannot be prerendered
export const dynamic = "force-dynamic";
import TableWrapperUser from "./TableWrapperUser";

// Force dynamic rendering - Firebase data cannot be prerendered
export const dynamic = "force-dynamic";
import { ArrowRight, StopCircleIcon } from "lucide-react";

// Force dynamic rendering - Firebase data cannot be prerendered
export const dynamic = "force-dynamic";
import ArchivesAnnees from "../../../../../components/archives-annees";

// Force dynamic rendering - Firebase data cannot be prerendered
export const dynamic = "force-dynamic";
import Image from "next/image";

// Force dynamic rendering - Firebase data cannot be prerendered
export const dynamic = "force-dynamic";

async function Dashboard() {
  //const userId = user?.id;

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

  return (
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
  );
}

export default Dashboard;
