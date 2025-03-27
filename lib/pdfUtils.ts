import { PDFDocument } from 'pdf-lib';

export const extractCoverFromPDF = async (pdfBuffer: Buffer): Promise<string> => {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const coverImage:any = await pdfDoc.getPage(0).drawImage; // Example function to get image from the first page
  return coverImage; // This should return the image data or a path to the image
};




/** 
import { PDFDocument } from 'pdf-lib';

export async function extractCoverFromPDF(pdfBuffer: Buffer): Promise<string> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPage(0).drawImage;
  const firstPage = pages[0];

  const { width, height } = firstPage.getSize();

  // Note: `pdf-lib` does not support image extraction directly, you would need additional libraries or custom code
  // Here is a placeholder for your logic to convert the first page to an image
  // Assuming you have some way to convert the page to an image (using a different library or API)

  // For now, return a placeholder string
  return 'data:image/jpeg;base64,...'; // Replace with actual image data
}
*/