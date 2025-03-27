import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { extractCoverFromPDF } from '../../../lib/pdfUtils';
import fs from 'fs/promises';
import { Database } from '../../../types_db';
import formidable, { IncomingForm } from 'formidable';
import mime from 'mime-types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files, cover) => {
    if (err) {
      console.error('Error parsing the files:', err);
      return res.status(500).json({ message: 'Error parsing the files' });
    }

    try {
      const { year } = fields;
      const pdfFiles = files.pdfFiles; // `files.pdfFiles` is an array
      const cover = files.cover; // `files.pdfFiles` is an array

      if (!year || !pdfFiles || !cover) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const uploads = Array.isArray(pdfFiles) ? pdfFiles.map(async (pdfFile: any) => {
        console.log('Processing file:', pdfFile);
        console.log('Nom du fichier:', pdfFile.originalFilename);


        const pdfBuffer = await fs.readFile(pdfFile.filepath);
        
        if (!Buffer.isBuffer(pdfBuffer)) {
          throw new Error('Failed to read PDF file');
        }

        const coverImage = await extractCoverFromPDF(pdfBuffer);
        const mimeType = mime.lookup(pdfFile.originalFilename) || 'application/pdf';

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('lintelligentpdf')
          .upload(`public/${year}/${pdfFile.newFilename}`, pdfBuffer, {
            contentType: mimeType,
          });

        if (uploadError) {
          console.error('Error uploading to storage:', uploadError);
          throw uploadError;
        }

        const pdfUrl = supabase.storage
          .from('lintelligentpdf')
          .getPublicUrl(`public/${year}/${pdfFile.newFilename}`).data.publicUrl;

        console.log('PDF uploaded. URL:', pdfUrl);

        const { data, error } = await supabase
          .from('journauxpdf')
          .insert([{ title: pdfFile.originalFilename, coverImage, pdfPath: pdfUrl, annee: year }]);

        if (error) {
          console.error('Error inserting to database:', error);
          throw error;
        }

        return data;
      }) : [];

      const uploadCover = Array.isArray(cover) ? cover.map(async (cove: any) => {
        console.log('Processing file:', cove);
        console.log('Nom du fichier:', cove.originalFilename);


        const coverBuffer = await fs.readFile(cove.filepath);
        
        if (!Buffer.isBuffer(coverBuffer)) {
          throw new Error('Failed to read PDF file');
        }

        //const coverImage = await extractCoverFromPDF(pdfBuffer);
        const mimeType = mime.lookup(cove.originalFilename) || 'application/image';

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('coverpdf')
          .upload(`public/${cove.newFilename}`, coverBuffer, {
            contentType: mimeType,
          });

        if (uploadError) {
          console.error('Error uploading to storage:', uploadError);
          throw uploadError;
        }

        const coverUrl = supabase.storage
          .from('coverpdf')
          .getPublicUrl(`public/${cove.newFilename}`).data.publicUrl;

        console.log('COVER uploaded. URL:', coverUrl);

        const { data, error } = await supabase
          .from('liacoverpdf')
          .insert([{ coverImage: cove.originalFilename, coverLink: coverUrl }]);

          console.log("DATA", data)

        if (error) {
          console.error('Error inserting to database:', error);
          throw error;
        }

        return data;
      }) : [];

      const results = await Promise.all(uploads && uploadCover);

      console.log("RESULTS", results)

      res.status(200).json({ message: 'PDFs uploaded successfully', data: results });
    } catch (error) {
      console.error('Error uploading PDFs:', error);
      res.status(500).json({ message: 'Error uploading PDFs', error: error.message });
    }
  });
};

export default handler;







/** 
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { extractCoverFromPDF } from '../../../lib/pdfUtils';
import fs from 'fs/promises';
import formidable, { IncomingForm } from 'formidable';
import mime from 'mime-types';
import { Database } from '../../../types_db';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log("Enter API");

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing the files:', err);
      return res.status(500).json({ message: 'Error parsing the files' });
    }

    console.log("Fields:", fields);
    console.log("Files:", files);

    try {
      const { year } = fields;
      const pdfFiles = files.pdfFiles;

      if (!year || !pdfFiles) {
        console.error("Missing required fields");
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const uploads = Array.isArray(pdfFiles) ? pdfFiles.map(async (pdfFile: any) => {
        console.log(`Processing file: ${pdfFile.originalFilename}`);

        const pdfBuffer = await fs.readFile(pdfFile.filepath);

        if (!Buffer.isBuffer(pdfBuffer)) {
          throw new Error('Failed to read PDF file');
        }

        console.log("PDF buffer read successfully");

        const coverImage = await extractCoverFromPDF(pdfBuffer);
        console.log("Cover image extracted");

        const mimeType = mime.lookup(pdfFile.originalFilename) || 'application/pdf';

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('lintelligentpdf')
          .upload(`public/${year}/${pdfFile.newFilename}`, pdfBuffer, {
            contentType: mimeType,
          });

        if (uploadError) {
          console.error('Error uploading to storage:', uploadError);
          throw uploadError;
        }

        console.log("File uploaded to storage");

        const pdfUrl = supabase.storage
          .from('lintelligentpdf')
          .getPublicUrl(`public/${year}/${pdfFile.newFilename}`).data.publicUrl;

        console.log(`Public URL: ${pdfUrl}`);

        const { data, error } = await supabase
          .from('journauxpdf')
          .insert([{ title: pdfFile.originalFilename, coverImage, pdfPath: pdfUrl, annee: year }]);

        console.log("Data inserted into the database", data);

        if (error) {
          console.error('Error inserting to database:', error);
          throw error;
        }

        return data;
      }) : [];

      const results = await Promise.all(uploads);

      res.status(200).json({ message: 'PDFs uploaded successfully', data: results });
    } catch (error) {
      console.error('Error uploading PDFs:', error);
      res.status(500).json({ message: 'Error uploading PDFs', error: error.message });
    }
  });
};

export default handler;
*/


//https://xmkowggghwqpeccgymgi.supabase.co/storage/v1/object/public/lintelligentpdf/public/2024/cb2f10f112fc05bcc4a8d5c14


//https://xmkowggghwqpeccgymgi.supabase.co/storage/v1/object/public/lintelligentpdf/2024/cb2f10f112fc05bcc4a8d5c14

/** 
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { extractCoverFromPDF } from '../../../lib/pdfUtils';
import fs from 'fs';
import { Database } from '../../../types_db';
import formidable, { IncomingForm } from 'formidable';
import mime from 'mime-types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error parsing the files' });
    }

    try {
      const { title, date } = fields;
      const pdfFile = files.pdfFile[0]; // `files.pdfFile` is an array

      if (!title || !date || !pdfFile || typeof pdfFile.filepath !== 'string') {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const pdfBuffer = fs.readFileSync(pdfFile.filepath);

      // Ensure `pdfBuffer` is a Buffer type
      if (!Buffer.isBuffer(pdfBuffer)) {
        throw new Error('Failed to read PDF file');
      }

      const coverImage = await extractCoverFromPDF(pdfBuffer);

      // Define MIME type
      const mimeType = mime.lookup(pdfFile.originalFilename) || 'application/pdf';

      // Upload PDF to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('lintelligentpdf') // Make sure 'lintelligentpdf' is the bucket name
        .upload(`public/${pdfFile.newFilename}`, pdfBuffer, {
          contentType: mimeType,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL of the uploaded file
      const pdfUrl = supabase.storage
        .from('lintelligentpdf')
        .getPublicUrl(`public/${pdfFile.newFilename}`).data.publicUrl;

      // Save metadata to the database
      const { data, error } = await supabase
        .from('journauxpdf')
        .insert([{ title, date, coverImage, pdfPath: pdfUrl }]);

      if (error) {
        throw error;
      }

      res.status(200).json({ message: 'PDF uploaded successfully', data });
    } catch (error) {
      console.error('Error uploading PDF:', error);
      res.status(500).json({ message: 'Error uploading PDF', error });
    }
  });
};

export default handler;

*/