"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../types_db";
import { Button } from "../@/components/ui/button";
import { FaFilePdf } from "react-icons/fa";
import { Loader } from "lucide-react";
import PdfViewer from "./pdfViewer";
import "../styles/journalArchive.module.css";

interface Journauxpdf {
  id: string;
  title: string | null;
  coverImage: string | null;
  created_at: string;
  annee: string | null;
  pdfPath: string | null;
  updatedAt: string | null;
}

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

const JournalArchive: React.FC = () => {
  const [journauxpdf, setJournauxpdf] = useState<Journauxpdf[]>([]);
  const [filteredPdfs, setFilteredPdfs] = useState<Journauxpdf[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const [isClient, setIsClient] = useState(false);

  console.log("Liste des journaux récupérés", journauxpdf);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchJournals = async () => {
      const { data, error } = await supabase
        .from("journauxpdf")
        .select("*")
        .order("annee", { ascending: false });
      if (error) {
        console.error("Error fetching journals:", error);
        setError("Erreur lors de la récupération des journaux");
      } else {
        console.log("Fetched Journals:", data);
        data.forEach((journal, index) => {
          console.log(`Journal ${index}:`, journal);
        });
        setJournauxpdf(data);
        setFilteredPdfs(data);
      }
      setLoading(false);
    };

    fetchJournals();
  }, []);

  useEffect(() => {
    console.log("Selected Year:", selectedYear);
    if (selectedYear) {
      const filtered = journauxpdf.filter((journal) => {
        const parsedYear = JSON.parse(journal.annee || "[]")[0];
        console.log(`Filtering: ${parsedYear} === ${selectedYear}`);
        return parsedYear === selectedYear;
      });
      console.log("Filtered Journals:", filtered);
      setFilteredPdfs(filtered);
      setCurrentPage(1); // Reset to first page when filtering
    } else {
      setFilteredPdfs(journauxpdf);
    }
  }, [selectedYear, journauxpdf]);

  if (!isClient) return null;

  const handleYearClick = (year: string) => {
    setSelectedYear(year);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const viewJournal = (pdfPath: string | null) => {
    if (pdfPath) {
      setSelectedPdf(pdfPath);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPdfs = filteredPdfs.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredPdfs.length / itemsPerPage);

  const years = [
    "2009",
    "2010",
    "2011",
    "2012",
    "2013",
    "2014",
    "2015",
    "2016",
    "2017",
    "2018",
    "2019",
    "2020",
    "2021",
    "2022",
    "2023",
    "2024",
  ];

  return (
    <div>
      <h2 className="uppercase lg:text-4xl text-2xl font-black text-center p-12">
        Archives des parutions du quotidien l&apos;intelligent d&apos;Abidjan
      </h2>
      <div className="flex flex-wrap justify-center mb-8">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => handleYearClick(year)}
            className={`m-2 p-2 ${
              selectedYear === year ? "bg-blue-600" : "bg-slate-800"
            } hover:bg-blue-950 text-white text-lg rounded-md font-bold text-center`}
          >
            {year}
          </button>
        ))}
        <button
          onClick={() => setSelectedYear(null)}
          className={`m-2 p-2 ${
            selectedYear === null ? "bg-blue-600" : "bg-slate-800"
          } hover:bg-blue-950 text-white text-lg rounded-md font-bold text-center`}
        >
          Tout
        </button>
      </div>
      <div className="journalArchive lg:grid lg:grid-cols-4 grid grid-cols-3 gap-4">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader color="red" size={36} />
            <div className="ml-2">Chargement en cours...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center p-8 text-red-500">
            {error}
          </div>
        ) : (
          currentPdfs.length > 0 &&
          currentPdfs.map((journal) => (
            <div
              key={journal.id}
              className="journalItem p-4 border rounded shadow"
            >
              <div className="flex flex-col items-center">
                <FaFilePdf color="red" size={64} />
                <h3 className="text-center">{journal.title}</h3>
                <Button onClick={() => viewJournal(journal.pdfPath)}>
                  Lire
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => handlePageChange(i + 1)}
            className={`m-2 p-2 ${
              currentPage === i + 1 ? "bg-blue-600" : "bg-slate-800"
            } hover:bg-blue-950 text-white text-lg rounded-md font-bold text-center`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      {selectedPdf && (
        <div className="pdfViewerContainer fixed inset-0 bg-gray-800 bg-opacity-75 flex flex-col items-center justify-center">
          <div className="bg-white p-4 rounded shadow-lg w-4/5 max-h-[80vh] overflow-y-auto">
            <PdfViewer pdfPath={selectedPdf} />
            <Button onClick={() => setSelectedPdf(null)} className="mt-4">
              Fermer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalArchive;

/** 
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { useUser } from "@supabase/auth-helpers-react";
import { getSession } from "../lib/supabase-server";
import { Database } from "../types_db";
import { Button } from "../@/components/ui/button";
import { FaFilePdf } from "react-icons/fa";
import { Loader } from "lucide-react";
import PdfViewer from "./pdfViewer";
import "../styles/journalArchive.module.css";

interface Journauxpdf {
  id: string;
  title: string | null;
  coverImage: string | null;
  created_at: string;
  annee: string | null;
  pdfPath: string | null;
  updatedAt: string | null;
}

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

const JournalArchive: React.FC = () => {
  const [journauxpdf, setJournauxpdf] = useState<Journauxpdf[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const user = useUser();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const session = await getSession();
      if (!session) {
        router.push("/");
      }
    };
    checkUser();
  }, [router]);

  useEffect(() => {
    const fetchJournals = async () => {
      const { data, error } = await supabase
        .from("journauxpdf")
        .select("*")
        .order("annee", { ascending: false });
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

  if (!isClient) return null;

  const viewJournal = (pdfPath: string | null) => {
    if (pdfPath) {
      setSelectedPdf(pdfPath);
    }
  };

  return (
    <div>
      <h2 className="uppercase lg:text-4xl text-2xl font-black text-center p-12">
        Archives des parutions du quotidien l&apos;intelligent d&apos;Abidjan
      </h2>
      <div className="journalArchive lg:grid lg:grid-cols-4 grid grid-cols-3 gap-4">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader color="red" size={36} />
            <div className="ml-2">Chargement en cours...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center p-8 text-red-500">
            {error}
          </div>
        ) : (
          journauxpdf.length > 0 &&
          journauxpdf.map((journal) => (
            <div
              key={journal.id}
              className="journalItem p-4 border rounded shadow"
            >
              <div className="flex flex-col items-center">
                <FaFilePdf color="red" size={64} />
                <h3 className="text-center">{journal.title}</h3>
                <Button onClick={() => viewJournal(journal.pdfPath)}>
                  Lire
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      {selectedPdf && (
        <div className="pdfViewerContainer fixed inset-0 bg-gray-800 bg-opacity-75 flex flex-col items-center justify-center">
          <div className="bg-white p-4 rounded shadow-lg w-4/5 max-h-[80vh] overflow-y-auto">
            <PdfViewer pdfPath={selectedPdf} />
            <Button onClick={() => setSelectedPdf(null)} className="mt-4">
              Fermer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalArchive;

*/
