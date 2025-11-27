import ArchivesAnnees from "../../../../../components/archives-annees";
import TableWrapperUser from "./_TableWrapperUser";
import { FileType } from "../../../../../typings";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../../firebase";
import { GetServerSideProps } from "next";

interface DashboardProps {
  skeletonFiles: FileType[];
}

function Dashboard({ skeletonFiles }: DashboardProps) {
  return (
    <div className="border-t">
      <section className="container space-y-5">
        <div className="pt-5">
          <ArchivesAnnees />
        </div>
        <h2 className="text-2xl font-bold text-center pt-10">
          Archives 2009 des parutions de l&apos;Intelligent d&apos;Abidjan -
          Version numérique
        </h2>
        <div>
          <TableWrapperUser skeletonFiles={skeletonFiles} />
        </div>
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const docsResults = await getDocs(collection(db, "archives", "pdf", "2009"));

  const skeletonFiles: FileType[] = docsResults.docs.map((doc) => ({
    id: doc.id,
    filename: doc.data().filename || doc.id,
    timestamp: new Date(doc.data().timestamp?.seconds * 1000) || undefined,
    fullName: doc.data().fullName,
    downloadURL: doc.data().downloadURL,
    type: doc.data().type,
    size: doc.data().size,
  }));

  return {
    props: {
      skeletonFiles,
    },
  };
};

export default Dashboard;
