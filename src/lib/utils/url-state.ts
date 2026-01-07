
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
