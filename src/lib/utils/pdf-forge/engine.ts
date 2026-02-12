import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { get } from 'svelte/store';
import { files, pages, selectedPages, isProcessing, type PDFFile, type PDFPage } from './store';

// Initialize worker
if (typeof window !== 'undefined') {
    // Use the version from the installed package to ensure compatibility
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export async function loadPDFs(fileList: FileList | File[]) {
    isProcessing.set(true);
    try {
        const currentFiles = get(files);

        const newFiles: PDFFile[] = [];
        const newPages: PDFPage[] = [];

        // Convert FileList to array if needed
        const filesArray = Array.from(fileList);

        for (const file of filesArray) {
            if (file.type !== 'application/pdf') {
                console.warn(`Skipping non-PDF file: ${file.name}`);
                continue;
            }

            const arrayBuffer = await file.arrayBuffer();

            // Load for manipulation (pdf-lib)
            // We clone the buffer because both libraries might consume it
            const pdfDoc = await PDFDocument.load(arrayBuffer.slice(0));
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
        console.error("Failed to load PDF", e);
        alert("Failed to process some PDF files.");
    } finally {
        isProcessing.set(false);
    }
}

export async function mergeAndDownload(fileName: string = 'merged.pdf') {
    if (get(pages).length === 0) return;

    isProcessing.set(true);
    try {
        const currentFiles = get(files);
        const currentPages = get(pages);

        const mergedPdf = await PDFDocument.create();

        // Map files by ID for quick access
        const fileMap = new Map(currentFiles.map(f => [f.id, f]));

        for (const page of currentPages) {
            const file = fileMap.get(page.fileId);
            if (!file) continue;

            const [copiedPage] = await mergedPdf.copyPages(file.pdf, [page.pageIndex]);

            // Apply rotation (additive to existing)
            // pdf-lib rotation is absolute, so we get current and add ours
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

export function rotateSelectedPages(angle: number = 90) {
    const selected = get(selectedPages);
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

    // Revoke URLs for deleted pages
    const allPages = get(pages);
    allPages.forEach(p => {
        if (selected.has(p.id)) {
            URL.revokeObjectURL(p.imageSrc);
        }
    });

    pages.update(allPages => allPages.filter(p => !selected.has(p.id)));
    selectedPages.set(new Set());
}

export function clearAll() {
    const allPages = get(pages);
    allPages.forEach(p => URL.revokeObjectURL(p.imageSrc));

    files.set([]);
    pages.set([]);
    selectedPages.set(new Set());
}
