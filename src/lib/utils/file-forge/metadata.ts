export interface FileMetadata {
  name: string;
  type: string;
  size: number;
  lastModified: number;
  dimensions?: { width: number; height: number };
  pageCount?: number;
  fileCount?: number; // for zip
  files?: string[]; // for zip
}

export async function extractMetadata(file: File): Promise<FileMetadata> {
  const metadata: FileMetadata = {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified
  };

  try {
    if (file.type.startsWith('image/')) {
      const dimensions = await getImageDimensions(file);
      if (dimensions) metadata.dimensions = dimensions;
    } else if (file.type === 'application/pdf') {
      const pdfLib = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      // Load only headers if possible, but PDFDocument.load loads whole doc.
      // For very large PDFs this might be slow.
      // We can use { ignoreEncryption: true }
      const pdfDoc = await pdfLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      metadata.pageCount = pdfDoc.getPageCount();
    } else if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const content = await zip.loadAsync(file);
      const files: string[] = [];
      content.forEach((relativePath) => {
        files.push(relativePath);
      });
      metadata.fileCount = files.length;
      metadata.files = files.slice(0, 50); // Limit list
    }
  } catch (e) {
    console.warn('Failed to extract deep metadata', e);
  }

  return metadata;
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Invalid image'));
    }
    img.src = url;
  });
}
