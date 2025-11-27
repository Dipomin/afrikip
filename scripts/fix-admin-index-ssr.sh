#!/bin/bash

# Script pour convertir les pages admin/journal/pdf/{year}/index.tsx
# De: async function Dashboard() avec appel Firebase direct
# Vers: getServerSideProps pour éviter le prerendering

echo "🔧 Conversion des index.tsx vers getServerSideProps..."

# Liste des années
YEARS=("2009" "2010" "2011" "2012" "2013" "2017" "2018" "2019" "2020" "2021" "2022" "2023" "2024" "jour")

for year in "${YEARS[@]}"; do
  file="pages/admin/journal/pdf/$year/index.tsx"
  
  if [ -f "$file" ]; then
    echo "✅ Traitement: $file"
    
    # Créer un fichier temporaire avec la nouvelle structure
    cat > "$file" << 'EOF'
import ArchivesAnnees from "../../../../../components/archives-annees";
import TableWrapperUser from "./TableWrapperUser";
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
          Archives YEAR des parutions de l&apos;Intelligent d&apos;Abidjan -
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
  const docsResults = await getDocs(collection(db, "archives", "pdf", "YEAR"));

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
EOF
    
    # Remplacer YEAR par la vraie année
    sed -i '' "s/Archives YEAR/Archives $year/g" "$file"
    sed -i '' "s/\"YEAR\"/\"$year\"/g" "$file"
    
    echo "   ✓ Converti vers getServerSideProps"
  fi
done

echo ""
echo "🎉 Conversion terminée pour ${#YEARS[@]} fichiers!"
echo "   Les pages utilisent maintenant getServerSideProps au lieu d'async components"
