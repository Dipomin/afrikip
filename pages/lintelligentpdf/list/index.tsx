"use client";

import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import JournalArchive from "../../../components/journal-archives";
import Layout from "../../../components/layout";
import UserHeader from "../../../components/UserHeader";

const ListPDF = () => {
  const [user, loading] = useAuthState(auth);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role || null);
            setUserName(userData.name || userData.displayName || null);
          }
        } catch (error) {
          console.error("Erreur récupération données utilisateur:", error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <UserHeader user={user || null} userRole={userRole} userName={userName} />
      <JournalArchive />
    </Layout>
  );
};

export default ListPDF;
