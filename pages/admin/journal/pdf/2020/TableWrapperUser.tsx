import React, { useEffect, useState } from "react";
import { Button } from "../../../../../components/admin-journal/ui/button";
import { DataTableUser } from "../../../../../components/admin-journal/table/TableUser";
import { FileType } from "../../../../../typings";
import { Skeleton } from "../../../../../components/admin-journal/ui/skeleton";
import { columns } from "../../../../../components/admin-journal/table/columns";
import { db } from "../../../../../firebase";
import { query, collection, orderBy } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";

// Force dynamic rendering - Firebase data cannot be prerendered
export const dynamic = "force-dynamic";

"use client";

function TableWrapper({ skeletonFiles }: { skeletonFiles: FileType[] }) {
  //const user = useUser();
  const [initialFiles, setInitialFiles] = useState<FileType[]>([]);
  const [sort, setSort] = useState<"asc" | "desc">("desc");

  const [docs, loading, error] = useCollection(
    //user &&
    query(collection(db, "archives", "pdf", "2020"), orderBy("timestamp", sort))
  );

  useEffect(() => {
    if (!docs) return;
    const files: FileType[] = docs.docs.map((doc) => ({
      id: doc.id,
      filename: doc.data().filename || doc.id,
      timestamp:
        new globalThis.Date(doc.data().timestamp?.seconds * 1000) || undefined,
      fullName: doc.data().fileName,
      downloadURL: doc.data().downloadURL,
      type: doc.data().type,
      size: doc.data().size,
    }));

    setInitialFiles(files);
  }, [docs]);

  if (docs?.docs.length === undefined)
    return (
      <div className="flex flex-col">
        <Button variant={"outline"} className="ml-auto w-36 h-10 mb-5">
          <Skeleton className="h-5 w-full" />
        </Button>

        <div className="border rounded-lg">
          <div className="border-b h-12" />
          {skeletonFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center space-x-4 p-5 w-full"
            >
              <Skeleton className="h-12 w-12" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}

          {skeletonFiles.length === 0 && (
            <div className="flex items-center space-x-4 p-5 w-full">
              <Skeleton className="h-12 w-12" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}
        </div>
      </div>
    );

  return (
    <div className="flex flex-col space-y-5 pb-10">
      <Button
        className="ml-auto w-fit"
        onClick={() => setSort(sort === "desc" ? "asc" : "desc")}
      >
        Ranger par ordre ... {sort === "desc" ? "Récent" : "Ancien"}
      </Button>

      <DataTableUser columns={columns} data={initialFiles} />
    </div>
  );
}

export default TableWrapper;
