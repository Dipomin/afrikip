"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../firebase";
import { Button } from "../@/components/ui/button";
import Image from "next/image";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Calendar,
  Hash,
  Tag,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { onAuthStateChanged } from "firebase/auth";

interface JournalUploadForm {
  title: string;
  issueNumber: string;
  publicationDate: string;
  description: string;
  tags: string[];
  coverImage: File | null;
  pdfFile: File | null;
}

export default function ModernJournalUpload() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentTag, setCurrentTag] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [formData, setFormData] = useState<JournalUploadForm>({
    title: "",
    issueNumber: "",
    publicationDate: new Date().toISOString().split("T")[0],
    description: "",
    tags: [],
    coverImage: null,
    pdfFile: null,
  });

  const [previewURLs, setPreviewURLs] = useState<{
    cover: string | null;
    pdf: string | null;
  }>({
    cover: null,
    pdf: null,
  });

  // Vérifier l'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setCheckingAuth(false);

      if (!user) {
        toast.error("Vous devez être connecté pour uploader des journaux");
      }
    });

    return () => unsubscribe();
  }, []);
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "cover" | "pdf"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (type === "cover") {
      if (!file.type.startsWith("image/")) {
        toast.error("Veuillez sélectionner une image valide");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5 MB");
        return;
      }
      setFormData((prev) => ({ ...prev, coverImage: file }));
      setPreviewURLs((prev) => ({
        ...prev,
        cover: URL.createObjectURL(file),
      }));
    } else {
      if (file.type !== "application/pdf") {
        toast.error("Veuillez sélectionner un fichier PDF valide");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Le PDF ne doit pas dépasser 50 MB");
        return;
      }
      setFormData((prev) => ({ ...prev, pdfFile: file }));
      setPreviewURLs((prev) => ({ ...prev, pdf: file.name }));
    }
  };

  const addTag = () => {
    if (!currentTag.trim()) return;
    if (formData.tags.includes(currentTag.trim())) {
      toast.error("Ce tag existe déjà");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, currentTag.trim()],
    }));
    setCurrentTag("");
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérifier l'authentification
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour uploader des journaux");
      router.push("/connexion");
      return;
    }

    // Validation
    if (!formData.title || !formData.issueNumber || !formData.publicationDate) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!formData.coverImage) {
      toast.error("Veuillez ajouter une couverture");
      return;
    }

    if (!formData.pdfFile) {
      toast.error("Veuillez ajouter le fichier PDF du journal");
      return;
    }

    setLoading(true);
    setUploadProgress(10);

    try {
      const year = new Date(formData.publicationDate).getFullYear().toString();

      // Créer le document Firestore
      const docRef = await addDoc(collection(db, "archives", "pdf", year), {
        title: formData.title,
        issueNumber: formData.issueNumber,
        publicationDate: new Date(formData.publicationDate),
        description: formData.description,
        tags: formData.tags,
        filename: formData.pdfFile.name,
        size: formData.pdfFile.size,
        type: formData.pdfFile.type,
        year,
        uploadedAt: serverTimestamp(),
        views: 0,
        downloads: 0,
      });

      setUploadProgress(30);

      // Upload de la couverture
      const coverRef = ref(
        storage,
        `archives/covers/${year}/${docRef.id}_cover`
      );
      await uploadBytes(coverRef, formData.coverImage);
      const coverURL = await getDownloadURL(coverRef);

      setUploadProgress(60);

      // Upload du PDF
      const pdfRef = ref(storage, `archives/pdf/${year}/${docRef.id}`);
      await uploadBytes(pdfRef, formData.pdfFile);
      const pdfURL = await getDownloadURL(pdfRef);

      setUploadProgress(90);

      // Mise à jour avec les URLs
      await updateDoc(doc(db, "archives", "pdf", year, docRef.id), {
        coverImageURL: coverURL,
        downloadURL: pdfURL,
      });

      setUploadProgress(100);

      toast.success("Journal uploadé avec succès !");

      // Réinitialiser le formulaire
      setTimeout(() => {
        setFormData({
          title: "",
          issueNumber: "",
          publicationDate: new Date().toISOString().split("T")[0],
          description: "",
          tags: [],
          coverImage: null,
          pdfFile: null,
        });
        setPreviewURLs({ cover: null, pdf: null });
        setUploadProgress(0);
        router.reload();
      }, 2000);
    } catch (error: any) {
      console.error("Erreur upload:", error);

      // Messages d'erreur détaillés
      let errorMessage = "Erreur lors de l'upload";

      if (error.code === "permission-denied") {
        errorMessage =
          "Permissions insuffisantes. Vérifiez les règles Firebase.";
      } else if (error.code === "storage/unauthorized") {
        errorMessage =
          "Accès non autorisé au Storage. Connectez-vous à nouveau.";
      } else if (error.code === "unauthenticated") {
        errorMessage = "Session expirée. Veuillez vous reconnecter.";
        setTimeout(() => router.push("/connexion"), 2000);
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          📰 Ajouter un nouveau journal
        </h1>
        <p className="text-gray-600">
          Remplissez tous les champs pour publier l&apos;édition du jour
        </p>
      </div>

      {/* Avertissement si non authentifié */}
      {!checkingAuth && !isAuthenticated && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">
              Authentification requise
            </h3>
            <p className="text-sm text-red-700 mb-3">
              Vous devez être connecté pour uploader des journaux.
            </p>
            <button
              onClick={() => router.push("/connexion")}
              className="text-sm font-semibold text-red-700 hover:text-red-900 underline"
            >
              Se connecter →
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section informations principales */}
        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Informations principales
          </h2>

          {/* Titre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Titre du journal *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ex: L'Intelligent d'Abidjan"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Numéro et Date */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                <Hash className="w-4 h-4" />
                Numéro de parution *
              </label>
              <input
                type="text"
                name="issueNumber"
                value={formData.issueNumber}
                onChange={handleInputChange}
                placeholder="Ex: N° 1234"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                Date de publication *
              </label>
              <input
                type="date"
                name="publicationDate"
                value={formData.publicationDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Une brève description du contenu de ce numéro..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
              <Tag className="w-4 h-4" />
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
                placeholder="Ex: politique, économie, sport..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button
                type="button"
                onClick={addTag}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section fichiers */}
        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Fichiers
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Upload couverture */}
            <div>
              <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                <ImageIcon className="w-4 h-4" />
                Image de couverture * (max 5 MB)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "cover")}
                  className="hidden"
                  id="cover-upload"
                />
                <label
                  htmlFor="cover-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  {previewURLs.cover ? (
                    <Image
                      src={previewURLs.cover}
                      alt="Aperçu couverture"
                      fill
                      className="object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Cliquez pour ajouter
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        JPG, PNG, WebP
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Upload PDF */}
            <div>
              <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                Fichier PDF * (max 50 MB)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e, "pdf")}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  {previewURLs.pdf ? (
                    <div className="text-center p-4">
                      <FileText className="w-16 h-16 text-green-500 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-gray-900 break-words">
                        {previewURLs.pdf}
                      </p>
                      <p className="text-xs text-green-600 mt-2">
                        ✓ PDF sélectionné
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Cliquez pour ajouter le PDF
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Format PDF uniquement
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de progression */}
        {loading && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">
                Upload en cours... {uploadProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-lg font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Upload en cours...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Publier le journal
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
