"use client";

import { useState } from "react";
import axios from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../@/components/ui/form";
import { Input } from "../../@/components/ui/input";
import { Button } from "../../@/components/ui/button";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Loading from "../loading";
import Layout from "../../components/layout";
import { useToast } from "../../components/ui/use-toast";

const formSchema = z.object({
  year: z.string().min(1, {
    message: "L'année de publication est requise",
  }),
  files: z.any(),
  cover: z.any(),
});

const UploadPDFForm: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      year: "2024",
      files: null,
      cover: null,
    },
  });

  const onSubmit = async (values: any) => {
    const { year, files, cover } = values;

    if (!files || files.length === 0) {
      toast({ title: "Erreur", description: "Les fichiers PDF sont requis." });
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("year", year);
    formData.append("cover", cover);

    for (let i = 0; i < files.length; i++) {
      formData.append("pdfFiles", files[i]);
    }

    try {
      const response = await axios.post("/api/upload-pdf", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        title: "Succès",
        description: "Fichiers téléchargés avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors du téléchargement des fichiers:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors du téléchargement des fichiers.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout preview={""}>
      <div className="max-w-md mx-auto mt-10 p-4 border rounded-md shadow-md">
        <h2 className="text-2xl font-bold mb-4">
          Mise en ligne L&apos;intelligent en PDF
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="year">Année de parution</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      id="year"
                      placeholder="Année de parution"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="files"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="files">Journal PDF</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      id="files"
                      required
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          form.setValue("files", Array.from(e.target.files));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cover"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="cover">Couverture du Journal</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      id="cover"
                      required
                      onChange={(e) => {
                        if (e.target.files) {
                          form.setValue("cover", e.target.files[0]);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={uploading} className="w-full mt-4">
              {uploading ? <Loading /> : "Envoyer le journal"}
            </Button>
          </form>
        </Form>
      </div>
    </Layout>
  );
};

export default UploadPDFForm;


