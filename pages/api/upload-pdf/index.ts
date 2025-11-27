import { NextApiRequest, NextApiResponse } from 'next';
import { extractCoverFromPDF } from '../../../lib/pdfUtils';
import fs from 'fs/promises';
import formidable, { IncomingForm } from 'formidable';
import mime from 'mime-types';


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
      console.log("Upload disabled (Supabase removed)");
      res.status(200).json({ message: 'Upload disabled' });
    } catch (error) {
      console.error('Error uploading PDFs:', error);
      res.status(500).json({ message: 'Error uploading PDFs', error: error.message });
    }
  });
};

export default handler;






