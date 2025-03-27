"use client";
import { createClient } from "@supabase/supabase-js";
import { PropsWithChildren, useEffect, useState } from "react";
//import "styles/main.css";
import { Database } from "../../../types_db";
import { useSession } from "@supabase/auth-helpers-react";

export const dynamic = "force-dynamic";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function RootLayout({ children }: PropsWithChildren) {
  const [mounted, setMounted] = useState(false);
  const session = useSession();
  const user = session?.user;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <html lang="fr">
      <body className="bg-gray-400 loading">
        <div>
          {/* @ts-ignore */}

          <main
            id="skip"
            className="min-h-[calc(100dvh-4rem)] md:min-h[calc(100dvh-5rem)]"
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
