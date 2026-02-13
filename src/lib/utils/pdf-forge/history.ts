import { db, type PdfForgeHistory } from '$lib/db';
import { files, pages, selectedPages, isProcessing, type PDFFile, type PDFPage } from './store';
import { get } from 'svelte/store';
import { PDFDocument } from 'pdf-lib';

export async function saveSession(name: string = 'Untitled Session') {
    isProcessing.set(true);
    try {
        const currentFiles = get(files);
        const currentPages = get(pages);

        // Serialize files
        const serializedFiles = await Promise.all(currentFiles.map(async (f) => {
            const bytes = await f.pdf.save();
            const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
            return {
                id: f.id,
                name: f.name,
                blob
            };
        }));

        // Serialize pages (fetch thumbnails)
        const serializedPages = await Promise.all(currentPages.map(async (p) => {
            const response = await fetch(p.imageSrc);
            const blob = await response.blob();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { imageSrc, ...rest } = p;
            return {
                ...rest,
                imageBlob: blob
            };
        }));

        const historyItem: PdfForgeHistory = {
            name,
            files: serializedFiles,
            pages: serializedPages,
            createdAt: new Date(),
            starred: 0
        };

        await db.pdfForgeHistory.add(historyItem);

    } catch (e) {
        console.error('Failed to save session', e);
        // Ideally use a toast here, but for now we keep the structure.
        // We will add proper feedback later.
        throw e;
    } finally {
        isProcessing.set(false);
    }
}

export async function restoreSession(id: number) {
    isProcessing.set(true);
    try {
        const session = await db.pdfForgeHistory.get(id);
        if (!session) throw new Error('Session not found');

        // Restore files
        const newFiles: PDFFile[] = [];
        for (const f of session.files) {
            const arrayBuffer = await f.blob.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            newFiles.push({
                id: f.id,
                name: f.name,
                pdf,
                pageCount: pdf.getPageCount()
            });
        }

        // Restore pages
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newPages: PDFPage[] = session.pages.map((p: any) => ({
            id: p.id,
            fileId: p.fileId,
            pageIndex: p.pageIndex,
            rotation: p.rotation,
            imageSrc: URL.createObjectURL(p.imageBlob)
        }));

        files.set(newFiles);
        pages.set(newPages);
        selectedPages.set(new Set());

    } catch (e) {
        console.error('Failed to restore session', e);
        throw e;
    } finally {
        isProcessing.set(false);
    }
}

export async function getHistory() {
    return await db.pdfForgeHistory.orderBy('createdAt').reverse().toArray();
}

export async function deleteSession(id: number) {
    await db.pdfForgeHistory.delete(id);
}
