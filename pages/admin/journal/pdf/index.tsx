import React from "react";
import Image from "next/image";
import ArchivesAnnees from "../../../../components/archives-annees";

function Dashboard() {
  return (
    <div className="border-t">
      <section className="container space-y-5">
        <h2 className="text-2xl font-bold text-center pt-10">
          Archives des parutions de l&apos;Intelligent d&apos;Abidjan - Version
          numérique
        </h2>
        <div className="flex justify-center">
          <Image
            alt="L'intelligent d'Abidjan"
            width={300}
            height={500}
            src={"/special-can-012.png"}
            className=" border-8 shadow-md"
          />
        </div>
        <ArchivesAnnees />
      </section>
    </div>
  );
}

export default Dashboard;
