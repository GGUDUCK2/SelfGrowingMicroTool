import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { get } from 'svelte/store';

export async function compressState(state: string): Promise<string> {
  const stream = new Blob([state]).stream();
  const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
  const compressedResponse = await new Response(compressedStream);
  const blob = await compressedResponse.blob();
  const buffer = await blob.arrayBuffer();
  // Base64 encode the binary data
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

export async function decompressState(compressed: string): Promise<string> {
  try {
    const binaryString = atob(compressed);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const stream = new Blob([bytes]).stream();
    const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
    const response = new Response(decompressedStream);
    return await response.text();
  } catch (e) {
    console.error("Decompression failed", e);
    return "";
  }
}

/**
 * Encodes an object to a compressed URL-safe string and updates the URL hash.
 */
export async function setUrlState(state: Record<string, any>) {
  if (!browser) return;

  const json = JSON.stringify(state);
  const compressed = await compressState(json);

  // Use replaceState to avoid cluttering history
  const url = new URL(window.location.href);
  url.hash = compressed;

  window.history.replaceState(history.state, '', url);
}

/**
 * Decodes the state from the URL hash.
 */
export async function getUrlState<T = Record<string, any>>(): Promise<T | null> {
    if (!browser) return null;

    const hash = window.location.hash.slice(1); // Remove #
    if (!hash) return null;

    try {
        const json = await decompressState(hash);
        if (!json) return null;
        return JSON.parse(json) as T;
    } catch (e) {
        console.error("Failed to parse state", e);
        return null;
    }
}
