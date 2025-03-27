"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "@supabase/auth-helpers-react";
import { ArrowRight, Loader } from "lucide-react";
import "../../../styles/journalArchive.module.css";
import { Database } from "../../../types_db";
import Image from "next/image";
import PdfViewer from "../../../components/pdfViewer";
import { Button } from "../../../components/ui/button";
import Layout from "../../../components/layout";
import { useRouter } from "next/navigation";

interface Journauxpdf {
  id: string;
  title: string | null;
  coverImage: string | null;
  created_at: string;
  annee: string | null;
  pdfPath: string | null;
  updatedAt: string | null;
}

interface CoverPdf {
  id: number;
  created_at: string | null;
  coverImage: string | null;
  coverLink: string | null;
}

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

const JournalArchive: React.FC = () => {
  const [journauxpdf, setJournauxpdf] = useState<Journauxpdf | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<Journauxpdf | null>(null);
  const [coverpdf, setCoverPdf] = useState<CoverPdf | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const route = useRouter();
  const session = useSession();
  const user = session?.user;

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchJournals = async () => {
      const { data, error } = await supabase
        .from("journauxpdf")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching journals:", error);
        setError("Erreur lors de la récupération des journaux");
      } else {
        setJournauxpdf(data);
      }
      setLoading(false);
    };

    fetchJournals();
  }, []);

  useEffect(() => {
    const fetchCover = async () => {
      const { data, error } = await supabase
        .from("liacoverpdf")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching journals:", error);
        setError("Erreur lors de la récupération des journaux");
      } else {
        setCoverPdf(data);
      }
      setLoading(false);
    };

    fetchCover();
  }, []);

  const viewJournal = () => {
    if (journauxpdf) {
      setSelectedPdf(journauxpdf);
    }
  };

  if (!isClient || loading) return <Loader className="m-auto" />;

  if (error) {
    return (
      <Layout user={user} preview={""}>
        <div className="text-center text-red-500">{error}</div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout user={user} preview={""}>
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
        <h2 className="uppercase lg:text-4xl text-2xl font-black text-center p-12">
          Parution du jour de l&apos;Intelligent d&apos;Abidjan <br /> Version
          numérique
        </h2>

        <div className="flex justify-center my-5">
          {coverpdf ? (
            <div className="flex flex-col pb-24">
              <Image
                src={coverpdf?.coverLink || ""}
                width={550}
                height={750}
                alt="L'intelligent d'Abidjan"
                className="flex justify-center pb-5"
              />
              <Button
                className="flex justify-center font-bold text-xl p-6 bg-blue-900 text-white hover:bg-gray-600 hover:animate-pulse rounded-md"
                onClick={viewJournal}
              >
                <span>Lire le journal</span> <ArrowRight />
              </Button>
            </div>
          ) : (
            <div className="text-2xl font-bold text-center pt-10">
              Aucun journal du jour trouvé.
            </div>
          )}
        </div>

        {selectedPdf && (
          <div className="pdfViewerContainer fixed inset-0 bg-gray-800 bg-opacity-75 flex flex-col items-center justify-center">
            <div className="bg-white p-4 rounded shadow-lg w-4/5 max-h-[80vh] overflow-y-auto">
              <Button
                variant={"destructive"}
                onClick={() => setSelectedPdf(null)}
                className="mt-4"
              >
                Fermer
              </Button>
              <PdfViewer pdfPath={selectedPdf.pdfPath || null} />
              <Button
                variant={"destructive"}
                onClick={() => setSelectedPdf(null)}
                className="mt-4"
              >
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Layout>
    );
  }
};

export default JournalArchive;
