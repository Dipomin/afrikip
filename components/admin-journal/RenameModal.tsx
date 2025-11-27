"use client";

import { useAppStore } from "../../store/store";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-hot-toast";

function RenameModal() {
  const [input, setInput] = useState("");
  const [isRenameModalOpen, setIsRenameModalOpen, fileId, filename] =
    useAppStore((state) => [
      state.isRenameModalOpen,
      state.setIsRenameModalOpen,
      state.fileId,
      state.setFilename,
    ]);

  const renameFile = async () => {
    if (!fileId) return;

    const toastId = toast.loading("Renaming...");

    await updateDoc(doc(db, "journal", "pdf", "files", fileId), {
      filename: input,
    });

    toast.success("Fichier renommer avec succès", {
      id: toastId,
    });

    setInput("");

    setIsRenameModalOpen(false);
  };

  return (
    <Dialog
      open={isRenameModalOpen}
      onOpenChange={(isOpen) => {
        setIsRenameModalOpen(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="pb-2">Renommer le fichier</DialogTitle>
        </DialogHeader>
        <Input
          id="link"
          //@ts-ignore
          defaultValue={filename}
          onChange={(e) => setInput(e.target.value)}
          onKeyDownCapture={(e) => {
            if (e.key === "Enter") {
              renameFile();
            }
          }}
        />
        <div className="flex space-x-2 py-3">
          <Button
            size="sm"
            className="px-3 flex-1"
            variant={"ghost"}
            onClick={() => setIsRenameModalOpen(false)}
          >
            <span className="sr-only">Annuler</span>
            <span>Annuler</span>
          </Button>
          <Button
            size="sm"
            className="px-3 flex-1"
            variant={"ghost"}
            onClick={renameFile}
          >
            <span className="sr-only">Renommer</span>
            <span>Renommer</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RenameModal;
