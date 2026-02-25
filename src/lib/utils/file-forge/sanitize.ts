import { PDFDocument } from 'pdf-lib';

/**
 * Strips EXIF and other metadata from images by re-encoding them via Canvas.
 * This is destructive but guarantees clean output.
 */
export async function stripImageMetadata(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(url);
                reject(new Error('Canvas context not supported'));
                return;
            }
            ctx.drawImage(img, 0, 0);

            // Re-encode. Use PNG for lossless (relative to pixel data) or JPEG for photos.
            // If original is JPEG, use JPEG high quality.
            const type = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';

            canvas.toBlob((blob) => {
                URL.revokeObjectURL(url);
                if (blob) resolve(blob);
                else reject(new Error('Canvas blob creation failed'));
            }, type, 0.95);
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Invalid image file'));
        };

        img.src = url;
    });
}

/**
 * Strips metadata (Author, Creator, etc.) from PDF files.
 * It creates a new document and copies pages to it, effectively leaving behind the old metadata dictionary.
 */
export async function stripPdfMetadata(file: File): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const originalPdf = await PDFDocument.load(arrayBuffer);

    // Create a new document
    const newPdf = await PDFDocument.create();

    // Copy all pages
    const pageIndices = originalPdf.getPageIndices();
    const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);

    copiedPages.forEach((page) => {
        newPdf.addPage(page);
    });

    // Explicitly clear metadata
    newPdf.setTitle('');
    newPdf.setAuthor('');
    newPdf.setSubject('');
    newPdf.setKeywords([]);
    newPdf.setProducer('File Forge (Sanitized)');
    newPdf.setCreator('');

    return await newPdf.save();
}
