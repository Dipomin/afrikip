import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/router";
import ModernJournalUpload from "../../../components/ModernJournalUpload";
import UserHeader from "../../../components/UserHeader";
import { FileType } from "../../../typings";
import { GetServerSideProps } from "next";
import TableWrapper from "./components/table/TableWrapper";
import Layout from "../../../components/layout";
import { Loader2, Shield, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface DashboardProps {
  skeletonFiles: FileType[];
}

interface UserData {
  role?: string;
  nom?: string;
  prenom?: string;
}

export default function Dashboard({ skeletonFiles }: DashboardProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setChecking(true);

      if (!currentUser) {
        // Pas connecté - rediriger vers connexion
        toast.error("Vous devez être connecté pour accéder à cette page");
        router.push("/connexion?redirect=/journal");
        return;
      }

      try {
        // Récupérer les données utilisateur depuis Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data() as UserData;
          setUserData(data);

          // Vérifier le rôle ADMIN
          if (data.role !== "ADMIN") {
            toast.error("Accès refusé : vous devez être administrateur");
            router.push("/");
            return;
          }
        } else {
          // Document utilisateur n'existe pas
          toast.error("Profil utilisateur introuvable");
          router.push("/connexion");
          return;
        }
      } catch (error: any) {
        console.error("Erreur récupération utilisateur:", error);
        toast.error("Erreur lors de la vérification des permissions");
        router.push("/");
        return;
      } finally {
        setChecking(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Afficher le loader pendant la vérification
  if (checking || loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900">
              Vérification des permissions...
            </p>
            <p className="text-sm text-gray-600 mt-2">Veuillez patienter</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Vérifier une dernière fois avant d'afficher (sécurité supplémentaire)
  if (!user || userData?.role !== "ADMIN") {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="w-8 h-8" />
              <h2 className="text-2xl font-black">Accès refusé</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Vous devez être administrateur pour accéder à cette page.
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const userName =
    userData?.prenom && userData?.nom
      ? `${userData.prenom} ${userData.nom}`
      : null;

  return (
    <Layout>
      <UserHeader user={user} userRole={userData?.role} userName={userName} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <ModernJournalUpload />
        <section className="container mx-auto px-6 py-12 space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              📚 Journaux publiés
            </h2>
            <p className="text-gray-600">Tous les journaux uploadés</p>
          </div>
          <TableWrapper skeletonFiles={skeletonFiles} />
        </section>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<DashboardProps> = async (
  context
) => {
  try {
    // Récupérer toutes les années disponibles (2022-2024)
    const years = ["2024", "2023", "2022"];
    let allFiles: FileType[] = [];

    for (const year of years) {
      const docsResults = await getDocs(
        collection(db, "archives", "pdf", year)
      );

      const yearFiles = docsResults.docs.map((doc) => ({
        id: doc.id,
        filename: doc.data().filename || doc.id,
        timestamp: doc.data().uploadedAt?.seconds
          ? new Date(doc.data().uploadedAt.seconds * 1000).toISOString()
          : doc.data().timestamp?.seconds
            ? new Date(doc.data().timestamp.seconds * 1000).toISOString()
            : null,
        fullName:
          doc.data().title ||
          doc.data().fullName ||
          doc.data().filename ||
          doc.id,
        downloadURL: doc.data().downloadURL || "",
        type: doc.data().type || "",
        size: doc.data().size || 0,
      }));

      allFiles = [...allFiles, ...yearFiles];
    }

    // Trier par date décroissante
    allFiles.sort((a, b) => {
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return {
      props: {
        skeletonFiles: allFiles,
      },
    };
  } catch (error) {
    console.error("Error fetching archives:", error);
    return {
      props: {
        skeletonFiles: [],
      },
    };
  }
};
