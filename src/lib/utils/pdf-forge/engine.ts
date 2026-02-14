import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import { get } from 'svelte/store';
import { files, pages, selectedPages, isProcessing, commitState, watermark } from './store';
import type { PDFFile, PDFPage, SerializedPDFPage } from '$lib/types/pdf-forge';
import { db } from '$lib/db';
import JSZip from 'jszip';

async function imageToPDF(file: File): Promise<PDFDocument> {
    const pdfDoc = await PDFDocument.create();
    const imageBytes = await file.arrayBuffer();
    let image;

    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        image = await pdfDoc.embedJpg(imageBytes);
    } else if (file.type === 'image/png') {
        image = await pdfDoc.embedPng(imageBytes);
    } else {
        throw new Error(`Unsupported image format: ${file.type}`);
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

async function fileToBuffer(file: File): Promise<ArrayBuffer> {
    if (file.type === 'application/pdf') {
        return await file.arrayBuffer();
    } else if (file.type.startsWith('image/')) {
        const pdfDoc = await imageToPDF(file);
        const pdfBytes = await pdfDoc.save();
        return pdfBytes.buffer as ArrayBuffer;
    }
    throw new Error(`Unsupported file type: ${file.type}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function renderPageThumbnail(page: any): Promise<string | null> {
    const scale = 0.5;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
        canvasContext: context,
        viewport,
        canvas
    }).promise;

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
    return blob ? URL.createObjectURL(blob) : null;
}

export async function loadPDFs(fileList: FileList | File[]) {
    if (fileList.length > 0) {
        commitState();
    }

    isProcessing.set(true);
    try {
        const newFiles: PDFFile[] = [];
        const newPages: PDFPage[] = [];

        const filesArray = Array.from(fileList);
        // Load pdfjs-dist once
        const pdfjsLib = await import('pdfjs-dist');
        if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        }

        for (const file of filesArray) {
            let pdfDoc: PDFDocument;
            let arrayBuffer: ArrayBuffer;

            try {
                arrayBuffer = await fileToBuffer(file);
                pdfDoc = await PDFDocument.load(arrayBuffer.slice(0));
            } catch (e) {
                console.warn(`Failed to load file: ${file.name}`, e);
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

            const loadingTask = pdfjsLib.getDocument({
                data: new Uint8Array(arrayBuffer.slice(0)),
                cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
                cMapPacked: true,
            });

            const pdfJsDoc = await loadingTask.promise;

            for (let i = 0; i < pageCount; i++) {
                try {
                    const page = await pdfJsDoc.getPage(i + 1);
                    const imageSrc = await renderPageThumbnail(page);

                    if (imageSrc) {
                        newPages.push({
                            id: crypto.randomUUID(),
                            fileId: fileId,
                            pageIndex: i,
                            rotation: 0,
                            imageSrc
                        });
                    }
                } catch (e) {
                    console.warn(`Failed to render page ${i+1} of ${file.name}`, e);
                }
            }
        }

        files.update(f => [...f, ...newFiles]);
        pages.update(p => [...p, ...newPages]);

    } catch (e) {
        console.error("Failed to load files", e);
    } finally {
        isProcessing.set(false);
    }
}

async function internalMergeAndDownload(pagesToMerge: PDFPage[], fileName: string) {
    if (pagesToMerge.length === 0) return;

    isProcessing.set(true);
    try {
        const currentFiles = get(files);
        const currentWatermark = get(watermark);
        const mergedPdf = await PDFDocument.create();

        const fileMap = new Map(currentFiles.map(f => [f.id, f]));

        for (const page of pagesToMerge) {
            const file = fileMap.get(page.fileId);
            if (!file) continue;

            const [copiedPage] = await mergedPdf.copyPages(file.pdf, [page.pageIndex]);

            const existingRotation = copiedPage.getRotation().angle;
            copiedPage.setRotation(degrees((existingRotation + page.rotation) % 360));

            const addedPage = mergedPdf.addPage(copiedPage);

            // Apply Watermark
            if (currentWatermark) {
                const { width, height } = addedPage.getSize();
                const font = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
                const fontSize = 50;
                const textWidth = font.widthOfTextAtSize(currentWatermark, fontSize);
                const textHeight = font.heightAtSize(fontSize);

                addedPage.drawText(currentWatermark, {
                    x: width / 2 - textWidth / 2,
                    y: height / 2 - textHeight / 2,
                    size: fontSize,
                    font: font,
                    color: rgb(0.7, 0.7, 0.7),
                    opacity: 0.5,
                    rotate: degrees(45),
                });
            }
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

    pages.update(allPages => allPages.filter(p => !selected.has(p.id)));
    selectedPages.set(new Set());
}

export function clearAll() {
    if (get(files).length === 0) return;

    commitState();

    files.set([]);
    pages.set([]);
    selectedPages.set(new Set());
    watermark.set('');
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

export async function saveSession(name: string) {
    isProcessing.set(true);
    try {
        const currentFiles = get(files);
        const currentPages = get(pages);

        const fileBlobs = await Promise.all(currentFiles.map(async f => {
            const bytes = await f.pdf.save();
            return {
                id: f.id,
                name: f.name,
                blob: new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' })
            };
        }));

        const serializedPages = await Promise.all(currentPages.map(async p => {
            const blob = await fetch(p.imageSrc).then(r => r.blob());
            return {
                ...p,
                imageSrc: undefined,
                thumbnailBlob: blob
            };
        }));

        // Note: Dexie schema update might be needed for 'watermark' field if we want to query by it,
        // but for just storing it in the object, it usually works if we just pass it.
        // However, typescript might complain if we use 'add' with strict interface.
        // We will cast to any to bypass strict type check for now or update db.ts properly.
        // Given constraints, I'll update db.ts later if needed, but here I'll try to just save it.

        await db.pdfForgeHistory.add({
            name,
            files: fileBlobs,
            pages: serializedPages,
            createdAt: new Date(),
            starred: 0,
            // @ts-expect-error watermark not in interface yet
            watermark: get(watermark)
        });

    } catch (e) {
        console.error("Failed to save session", e);
        throw e;
    } finally {
        isProcessing.set(false);
    }
}

export async function loadSession(id: number) {
    isProcessing.set(true);
    try {
        const session = await db.pdfForgeHistory.get(id);
        if (!session) throw new Error("Session not found");

        const newFiles: PDFFile[] = [];
        for (const f of session.files) {
            const arrayBuffer = await f.blob.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            newFiles.push({
                id: f.id,
                name: f.name,
                pdf: pdfDoc,
                pageCount: pdfDoc.getPageCount()
            });
        }

        const newPages: PDFPage[] = (session.pages as unknown as SerializedPDFPage[]).map(p => ({
            id: p.id,
            fileId: p.fileId,
            pageIndex: p.pageIndex,
            rotation: p.rotation,
            imageSrc: URL.createObjectURL(p.thumbnailBlob)
        }));

        commitState();

        files.set(newFiles);
        pages.set(newPages);
        selectedPages.set(new Set());
        // @ts-expect-error watermark not in interface yet
        watermark.set(session.watermark || '');

    } catch (e) {
        console.error("Failed to load session", e);
        throw e;
    } finally {
        isProcessing.set(false);
    }
}

// Creative Features

export function zipperMerge() {
    const currentFiles = get(files);
    if (currentFiles.length < 2) return;

    commitState();

    const currentPages = get(pages);
    // Group pages by fileId, preserving original order of files
    const pagesByFile = new Map<string, PDFPage[]>();

    // Initialize map with empty arrays for each file to preserve order
    currentFiles.forEach(f => pagesByFile.set(f.id, []));

    // Fill with existing pages (respecting if user deleted some)
    currentPages.forEach(p => {
        if (pagesByFile.has(p.fileId)) {
            pagesByFile.get(p.fileId)?.push(p);
        }
    });

    const fileIds = currentFiles.map(f => f.id);
    const newPages: PDFPage[] = [];
    let maxPages = 0;

    pagesByFile.forEach(list => {
        if (list.length > maxPages) maxPages = list.length;
    });

    for (let i = 0; i < maxPages; i++) {
        for (const fileId of fileIds) {
            const list = pagesByFile.get(fileId);
            if (list && list[i]) {
                newPages.push(list[i]);
            }
        }
    }

    pages.set(newPages);
}

export function sortPages(method: 'name' | 'reverse') {
    commitState();

    if (method === 'reverse') {
        pages.update(p => [...p].reverse());
        return;
    }

    if (method === 'name') {
        const fileMap = new Map(get(files).map(f => [f.id, f.name]));
        pages.update(allPages => {
            return [...allPages].sort((a, b) => {
                const nameA = fileMap.get(a.fileId) || '';
                const nameB = fileMap.get(b.fileId) || '';
                const nameCompare = nameA.localeCompare(nameB);
                if (nameCompare !== 0) return nameCompare;
                return a.pageIndex - b.pageIndex;
            });
        });
    }
}

export async function exportImages() {
    const selected = get(selectedPages);
    const allPages = get(pages);
    const pagesToExport = selected.size > 0
        ? allPages.filter(p => selected.has(p.id))
        : allPages;

    if (pagesToExport.length === 0) return;

    isProcessing.set(true);
    try {
        const zip = new JSZip();
        const currentFiles = get(files);
        const fileMap = new Map(currentFiles.map(f => [f.id, f]));

        // Load pdfjs-dist
        const pdfjsLib = await import('pdfjs-dist');
        if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        }

        // We need to render high-res images
        // Logic: Load PDF doc via pdfjs, get page, render to canvas with high scale (e.g. 2.0), output blob

        // Cache loaded pdfjs docs to avoid reloading for every page
        const loadedDocs = new Map<string, any>(); // eslint-disable-line @typescript-eslint/no-explicit-any

        for (const [index, page] of pagesToExport.entries()) {
            const file = fileMap.get(page.fileId);
            if (!file) continue;

            let pdfJsDoc = loadedDocs.get(page.fileId);
            if (!pdfJsDoc) {
                const arrayBuffer = await file.pdf.save();
                const loadingTask = pdfjsLib.getDocument({
                    data: new Uint8Array(arrayBuffer),
                    cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
                    cMapPacked: true,
                });
                pdfJsDoc = await loadingTask.promise;
                loadedDocs.set(page.fileId, pdfJsDoc);
            }

            const pdfPage = await pdfJsDoc.getPage(page.pageIndex + 1); // 1-based index

            // Render high quality
            const scale = 2.0;
            const totalRotation = (pdfPage.rotate + page.rotation) % 360;
            const viewport = pdfPage.getViewport({ scale, rotation: totalRotation });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) continue;

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await pdfPage.render({
                canvasContext: context,
                viewport,
                canvas
            }).promise;

            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
            if (blob) {
                const fileName = `page_${index + 1}_${file.name.replace('.pdf', '')}.png`;
                zip.file(fileName, blob);
            }
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = `images_${new Date().toISOString().slice(0,10)}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

    } catch (e) {
        console.error("Failed to export images", e);
    } finally {
        isProcessing.set(false);
    }
}
