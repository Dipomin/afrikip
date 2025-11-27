import DropZone from "../../../../../components/admin-journal/Dropzone";
import TableWrapper from "../../../../../components/admin-journal/table/TableWrapper";
import { db } from "../../../../../firebase";
import { FileType } from "../../../../../typings";
import { collection, getDocs } from "firebase/firestore";
import React from "react";

import Link from "next/link";
import { Button } from "../../../../../components/admin-journal/ui/button";
import TableWrapperUser from "./TableWrapperUser";
import ArchivesAnnees from "../../../../../components/archives-annees";

async function Dashboard() {
  //const userId = user?.id;

  //console.log(user);

  const docsResults = await getDocs(collection(db, "archives", "pdf", "2010"));

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
          Archives 2010 des parutions de l&apos;Intelligent d&apos;Abidjan -
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
