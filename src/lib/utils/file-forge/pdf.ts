import { PDFDocument } from 'pdf-lib';

export interface PdfMetadata {
  pageCount: number;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  encrypted: boolean;
  version?: string;
}

export async function analyzePdf(file: File): Promise<PdfMetadata> {
  const arrayBuffer = await file.arrayBuffer();

  try {
      // ignoreEncryption allows us to read metadata even if the file has a password (often)
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      return {
          pageCount: pdfDoc.getPageCount(),
          title: pdfDoc.getTitle(),
          author: pdfDoc.getAuthor(),
          subject: pdfDoc.getSubject(),
          creator: pdfDoc.getCreator(),
          producer: pdfDoc.getProducer(),
          creationDate: pdfDoc.getCreationDate(),
          modificationDate: pdfDoc.getModificationDate(),
          encrypted: pdfDoc.isEncrypted
      };
  } catch (e) {
      console.warn('PDF parsing error:', e);
      throw new Error('Could not parse PDF. It might be corrupted or encrypted with a strong password.');
  }
}
