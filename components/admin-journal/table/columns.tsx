"use client";

import { ColumnDef } from "@tanstack/react-table";
import { COLOR_EXTENSION_MAP } from "../../../constant";
import { FileType } from "../../../typings";
import prettyBytes from "pretty-bytes";
import { FileIcon, defaultStyles } from "react-file-icon";

export const columns: ColumnDef<FileType>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ renderValue, ...props }) => {
      const type = renderValue() as string;
      const extension: string = type.split("/")[1];

      return (
        <div className="w-8">
          <FileIcon
            extension={extension}
            labelColor={COLOR_EXTENSION_MAP[extension]}
            {...defaultStyles[extension]}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "filename",
    header: "Parution et date",
  },
  {
    accessorKey: "timestamp",
    header: "",
  },
  {
    accessorKey: "size",
    header: "Taille",
    cell: ({ renderValue, ...props }) => {
      return <span>{prettyBytes(renderValue() as number)}</span>;
    },
  },
  {
    accessorKey: "downloadURL",
    header: "Link",
    cell: ({ renderValue, ...props }) => (
      <a
        href={renderValue() as string}
        target="_blank"
        className=" bg-blue-900 rounded-xl p-2 text-white text-xl font-bold hover:text-white hover:underline hover:bg-slate-500"
      >
        Lire
      </a>
    ),
  },
];
