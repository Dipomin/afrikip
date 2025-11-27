"use client";

import { PropsWithChildren, useEffect, useState } from "react";



export default function RootLayout({ children }: PropsWithChildren) {
  const [mounted, setMounted] = useState(false);


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
