/**
 * Types pour le système de gestion des journaux
 */

import { Timestamp } from "firebase/firestore";

export interface JournalMetadata {
  id: string;
  title: string;
  issueNumber: string;
  publicationDate: Date | Timestamp;
  description?: string;
  tags: string[];
  coverImageURL: string;
  pdfURL: string;
  filename: string;
  size: number;
  year: string;
  uploadedAt: Timestamp;
  uploadedBy?: string;
  views?: number;
  downloads?: number;
}

export interface JournalUploadData {
  title: string;
  issueNumber: string;
  publicationDate: Date;
  description: string;
  tags: string[];
  coverImage: File | null;
  pdfFile: File | null;
}
