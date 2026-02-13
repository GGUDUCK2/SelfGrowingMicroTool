import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { get } from 'svelte/store';
import { files, pages, selectedPages, isProcessing, type PDFFile, type PDFPage, commitState } from './store';

// Initialize worker
if (typeof window !== 'undefined') {
    // Use the version from the installed package to ensure compatibility
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

async function imageToPDF(file: File): Promise<PDFDocument> {
    const pdfDoc = await PDFDocument.create();
    const imageBytes = await file.arrayBuffer();
    let image;

    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        image = await pdfDoc.embedJpg(imageBytes);
    } else if (file.type === 'image/png') {
        image = await pdfDoc.embedPng(imageBytes);
    } else {
        throw new Error('Unsupported image format');
    }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
    });

    return pdfDoc;
}

export async function loadPDFs(fileList: FileList | File[]) {
    // Commit state before adding new files
    // Check if we actually have files to process
    if (fileList.length > 0) {
        commitState();
    }

    isProcessing.set(true);
    try {
        const newFiles: PDFFile[] = [];
        const newPages: PDFPage[] = [];

        // Convert FileList to array if needed
        const filesArray = Array.from(fileList);

        for (const file of filesArray) {
            let pdfDoc: PDFDocument;
            let arrayBuffer: ArrayBuffer;

            if (file.type === 'application/pdf') {
                arrayBuffer = await file.arrayBuffer();
                pdfDoc = await PDFDocument.load(arrayBuffer.slice(0));
            } else if (file.type.startsWith('image/')) {
                try {
                    pdfDoc = await imageToPDF(file);
                    // Save the generated PDF as the source buffer
                    const pdfBytes = await pdfDoc.save();
                    arrayBuffer = pdfBytes.buffer as ArrayBuffer;
                } catch (e) {
                    console.warn(`Skipping unsupported image: ${file.name}`, e);
                    continue;
                }
            } else {
                console.warn(`Skipping unsupported file: ${file.name}`);
                continue;
            }

            const pageCount = pdfDoc.getPageCount();
            const fileId = crypto.randomUUID();

            newFiles.push({
                id: fileId,
                name: file.name,
                pdf: pdfDoc,
                pageCount
            });

            // Load for rendering (pdfjs-dist)
            const loadingTask = pdfjsLib.getDocument({
                data: new Uint8Array(arrayBuffer.slice(0)),
                cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
                cMapPacked: true,
            });

            const pdfJsDoc = await loadingTask.promise;

            for (let i = 0; i < pageCount; i++) {
                const page = await pdfJsDoc.getPage(i + 1);

                // Render thumbnail
                const scale = 0.5; // Thumbnail scale
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) continue;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport,
                    canvas
                }).promise;

                // Create blob URL for efficiency
                const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
                if (blob) {
                    newPages.push({
                        id: crypto.randomUUID(),
                        fileId: fileId,
                        pageIndex: i,
                        rotation: 0,
                        imageSrc: URL.createObjectURL(blob)
                    });
                }
            }
        }

        files.update(f => [...f, ...newFiles]);
        pages.update(p => [...p, ...newPages]);

    } catch (e) {
        console.error("Failed to load files", e);
        // Toast notification should be handled by UI observing store or event
        alert("Failed to process some files.");
    } finally {
        isProcessing.set(false);
    }
}

async function internalMergeAndDownload(pagesToMerge: PDFPage[], fileName: string) {
    if (pagesToMerge.length === 0) return;

    isProcessing.set(true);
    try {
        const currentFiles = get(files);
        const mergedPdf = await PDFDocument.create();

        // Map files by ID for quick access
        const fileMap = new Map(currentFiles.map(f => [f.id, f]));

        for (const page of pagesToMerge) {
            const file = fileMap.get(page.fileId);
            if (!file) continue;

            const [copiedPage] = await mergedPdf.copyPages(file.pdf, [page.pageIndex]);

            // Apply rotation (additive to existing)
            const existingRotation = copiedPage.getRotation().angle;
            copiedPage.setRotation(degrees((existingRotation + page.rotation) % 360));

            mergedPdf.addPage(copiedPage);
        }

        const pdfBytes = await mergedPdf.save();
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

    } catch (e) {
        console.error("Failed to merge", e);
        alert("Failed to merge PDF files.");
    } finally {
        isProcessing.set(false);
    }
}

export async function mergeAndDownload(fileName: string = 'merged.pdf') {
    await internalMergeAndDownload(get(pages), fileName);
}

export async function extractSelectedPages(fileName: string = 'extracted.pdf') {
    const selected = get(selectedPages);
    const allPages = get(pages);
    const subset = allPages.filter(p => selected.has(p.id));
    await internalMergeAndDownload(subset, fileName);
}

export function rotateSelectedPages(angle: number = 90) {
    const selected = get(selectedPages);
    if (selected.size === 0) return;

    commitState();
    pages.update(allPages => {
        return allPages.map(p => {
            if (selected.has(p.id)) {
                // Normalize to 0, 90, 180, 270
                const newRotation = (p.rotation + angle) % 360;
                return { ...p, rotation: newRotation < 0 ? newRotation + 360 : newRotation };
            }
            return p;
        });
    });
}

export function deleteSelectedPages() {
    const selected = get(selectedPages);
    if (selected.size === 0) return;

    commitState();

    // Revoke URLs for deleted pages (optional, but good for memory)
    // Note: If we undo, we might need these URLs.
    // BUT since we committed state, the 'past' state has the URLs.
    // However, URL.revokeObjectURL kills the URL globally.
    // If we undo, the page will have a broken image.
    // CRITICAL FIX: Do NOT revoke object URLs if we plan to undo!
    // We rely on browser GC when document is unloaded or we explicitly clear history.

    /*
    const allPages = get(pages);
    allPages.forEach(p => {
        if (selected.has(p.id)) {
            URL.revokeObjectURL(p.imageSrc);
        }
    });
    */

    pages.update(allPages => allPages.filter(p => !selected.has(p.id)));
    selectedPages.set(new Set());
}

export function clearAll() {
    if (get(files).length === 0) return;

    commitState();

    // Same here, do not revoke if we want undo.
    /*
    const allPages = get(pages);
    allPages.forEach(p => URL.revokeObjectURL(p.imageSrc));
    */

    files.set([]);
    pages.set([]);
    selectedPages.set(new Set());
}

export function reorderPages(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;

    commitState();

    pages.update(all => {
      const newPages = [...all];
      const [removed] = newPages.splice(fromIndex, 1);
      newPages.splice(toIndex, 0, removed);
      return newPages;
    });
}
