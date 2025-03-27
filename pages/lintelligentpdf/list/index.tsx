import React, { useEffect } from "react";
import JournalArchive from "../../../components/journal-archives";
import Layout from "../../../components/layout";
import { useSession, useUser } from "@supabase/auth-helpers-react";
import { getSession } from "../../../lib/supabase-server";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";

const ListPDF = () => {
  const session = useSession();
  const user = session?.user;
  const route = useRouter();

  {
    /** 
  useEffect(() => {
    const checkUser = async () => {
      const session = await getSession();
      if (!session) {
        route.push("/signin");
      }
    };
    checkUser();
  }, [router]);
*/
  }
  if (!user) {
    return (
      <Layout user={""} preview={""}>
        <div className="grid grid-cols-1 justify-items-center text-center p-10">
          <div className="w-[500px] bg-slate-300/50 rounded-md p-8">
            <div className="text-lg font-bold text-red-600">
              Désolé, vous n'êtes pas connecté à votre compte. <br />{" "}
              Connectez-vous ou créez-en un.
            </div>
            <Button onClick={() => route.push("/signin")}>
              Créer un compte
            </Button>
          </div>
        </div>
      </Layout>
    );
  } else {
    return (
      <Layout user={user} preview={""}>
        <JournalArchive />
      </Layout>
    );
  }
};

export default ListPDF;
