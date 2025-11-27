"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useRouter } from "next/router";

type FirebaseAuthContext = {
  user: User | null;
  loading: boolean;
};

const Context = createContext<FirebaseAuthContext | undefined>(undefined);

export default function FirebaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      // Stocker le token dans les cookies pour SSR
      if (user) {
        user.getIdToken().then((token) => {
          document.cookie = `firebaseToken=${token}; path=/; max-age=3600; SameSite=Lax`;
        });
      } else {
        document.cookie = "firebaseToken=; path=/; max-age=0";
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <Context.Provider value={{ user, loading }}>
      <>{children}</>
    </Context.Provider>
  );
}

export const useFirebaseAuth = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("useFirebaseAuth must be used inside FirebaseAuthProvider");
  }

  return context;
};
