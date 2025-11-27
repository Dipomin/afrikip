"use client";

import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useAppStore } from "../../../../store/store";
import { db, storage } from "../../../../firebase";
import { deleteObject, ref } from "firebase/storage";
import { deleteDoc, doc } from "firebase/firestore";
import toast from "react-hot-toast";

export function DeleteModal() {
  const [isDeleteModalOpen, setIsDeleteModalOpen, fileId, setFileId] =
    useAppStore((state) => [
      state.isDeleteModalOpen,
      state.setIsDeleteModalOpen,
      state.fileId,
      state.setFileId,
    ]);

  const deleteFile = () => {
    return (
      <Dialog
        open={isDeleteModalOpen}
        onOpenChange={(isOpen) => {
          setIsDeleteModalOpen(isOpen);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete ?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              file!
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-2 py-3">
            <Button
              size="sm"
              className="px-3 flex-1"
              variant={"ghost"}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              <span className="sr-only">Cancel</span>
              <span>Cancel</span>
            </Button>
            <Button
              type="submit"
              size="sm"
              variant={"destructive"}
              className="px-3 flex-1"
              onClick={() => deleteFile()}
            >
              <span className="sr-only">Delete</span>
              <span>Delete</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
}
