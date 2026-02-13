import type { PDFDocument } from 'pdf-lib';
import type { dictionaries } from '$lib/dictionaries';

export type PdfForgeDictionary = typeof dictionaries.en.tools.pdfForge;

export interface PDFFile {
  id: string;
  name: string;
  pdf: PDFDocument;
  pageCount: number;
}

export interface PDFPage {
  id: string; // unique id for UI
  fileId: string; // link back to PDFFile
  pageIndex: number; // 0-based index in original file
  rotation: number; // 0, 90, 180, 270 (additive to original)
  imageSrc: string; // Data URL of thumbnail
}
