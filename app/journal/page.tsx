import DropZone from "./components/Dropzone";
import TableWrapper from "./components/table/TableWrapper";
import { db } from "../../firebase";
import { FileType } from "../../typings";
import { collection, getDocs } from "firebase/firestore";
import React from "react";
import {
  getSession,
  getSubscription,
  getActiveProductsWithPrices,
} from "../supabase-server";
import Button from "../../components/button";
import Link from "next/link";
import { useUser } from "@supabase/auth-helpers-react";
import { redirect } from "next/navigation";

async function Dashboard() {
  const [session, products, subscription] = await Promise.all([
    getSession(),
    getActiveProductsWithPrices(),
    getSubscription(),
  ]);

  const userId = session?.user.id || undefined || null;
  //console.log(userId);
  const user = session?.user || undefined || null;
  //console.log("Email:", user?.email);
  /** 
  const userEmail = user?.email;
  const allowedEmails = (
    await getDocs(collection(db, "allowedEmails"))
  ).docs.map((doc) => doc.data().email);
  if (!allowedEmails.includes(userEmail)) {
    redirect("/");
    return null;
  }
*/
  const docsResults = await getDocs(collection(db, "archives", "pdf", "2024"));
  const skeletonFiles: FileType[] = docsResults.docs.map((doc) => ({
    id: doc.id,
    filename: doc.data().filename || doc.id,
    timestamp: new Date(doc.data().timestamp?.seconds * 1000) || undefined,
    fullName: doc.data().fullName,
    downloadURL: doc.data().downloadURL,
    type: doc.data().type,
    size: doc.data().size,
  }));

  return userId ? (
    <div className="border-t">
      <DropZone />

      <section className="container space-y-5">
        <h2 className="text-2xl font-bold text-center">
          Ajouter des archives du journal l&apos;Intelligent d&apos;Abidjan
        </h2>
        <div>
          <TableWrapper skeletonFiles={skeletonFiles} />
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
