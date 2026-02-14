import { writable, get } from 'svelte/store';
import type { PDFFile, PDFPage } from '$lib/types/pdf-forge';

interface State {
    files: PDFFile[];
    pages: PDFPage[];
    watermark: string;
}

export const files = writable<PDFFile[]>([]);
export const pages = writable<PDFPage[]>([]);
export const selectedPages = writable<Set<string>>(new Set());
export const isProcessing = writable(false);
export const watermark = writable<string>('');

// Time Machine
export const past = writable<State[]>([]);
export const future = writable<State[]>([]);

export function commitState() {
    const currentFiles = get(files);
    const currentPages = get(pages);
    const currentWatermark = get(watermark);
    past.update(h => {
        const newHistory = [...h, {
            files: [...currentFiles],
            pages: currentPages.map(p => ({ ...p })),
            watermark: currentWatermark
        }];
        if (newHistory.length > 20) newHistory.shift();
        return newHistory;
    });
    future.set([]);
}

export function undo() {
    const history = get(past);
    if (history.length === 0) return;

    const previous = history[history.length - 1];
    const newPast = history.slice(0, -1);

    const currentFiles = get(files);
    const currentPages = get(pages);
    const currentWatermark = get(watermark);

    // Save current state to future
    future.update(f => [{
        files: [...currentFiles],
        pages: currentPages.map(p => ({ ...p })),
        watermark: currentWatermark
    }, ...f]);

    past.set(newPast);

    files.set(previous.files);
    pages.set(previous.pages);
    watermark.set(previous.watermark);
    selectedPages.set(new Set());
}

export function redo() {
    const futureState = get(future);
    if (futureState.length === 0) return;

    const [next, ...remainingFuture] = futureState;

    const currentFiles = get(files);
    const currentPages = get(pages);
    const currentWatermark = get(watermark);

    // Save current state to past
    past.update(h => [...h, {
        files: [...currentFiles],
        pages: currentPages.map(p => ({ ...p })),
        watermark: currentWatermark
    }]);

    future.set(remainingFuture);

    files.set(next.files);
    pages.set(next.pages);
    watermark.set(next.watermark);
    selectedPages.set(new Set());
}
