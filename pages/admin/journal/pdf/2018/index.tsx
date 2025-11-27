import { db } from "../../../../../firebase";

// Force dynamic rendering - Firebase data cannot be prerendered
export const dynamic = "force-dynamic";
import { FileType } from "../../../../../typings";

// Force dynamic rendering - Firebase data cannot be prerendered
export const dynamic = "force-dynamic";
import { collection, getDocs } from "firebase/firestore";

// Force dynamic rendering - Firebase data cannot be prerendered
export const dynamic = "force-dynamic";
import React from "react";

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
import ArchivesAnnees from "../../../../../components/archives-annees";

// Force dynamic rendering - Firebase data cannot be prerendered
export const dynamic = "force-dynamic";

async function Dashboard() {
  //const userId = user?.id;

  //console.log(user);

  const docsResults = await getDocs(collection(db, "archives", "pdf", "2018"));

  //console.log("Docs results",docsResults.docs.map((doc) => doc.data()));

  const skeletonFiles: FileType[] = docsResults.docs.map((doc) => ({
    id: doc.id,
    filename: doc.data().filename || doc.id,
    timestamp: new Date(doc.data().timestamp?.seconds * 1000) || undefined,
    fullName: doc.data().fullName,
    downloadURL: doc.data().downloadURL,
    type: doc.data().type,
    size: doc.data().size,
  }));

  //console.log("Skeleton Files :", skeletonFiles);

  return (
    <div className="border-t">
      <section className="container space-y-5">
        <div className="pt-5">
          <ArchivesAnnees />
        </div>
        <h2 className="text-2xl font-bold text-center pt-10">
          Archives 2018 des parutions de l&apos;Intelligent d&apos;Abidjan -
          Version numérique
        </h2>
        <div>
          <TableWrapperUser skeletonFiles={skeletonFiles} />
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
