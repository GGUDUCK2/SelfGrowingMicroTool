import JSZip from 'jszip';

export interface ArchiveAnalysis {
  fileCount: number;
  totalSize: number;
  compressedSize: number;
  compressionRatio: number;
  files: Array<{ name: string; size: number; compressedSize: number; dir: boolean }>;
  encrypted: boolean;
}

export async function analyzeArchive(file: File): Promise<ArchiveAnalysis> {
  const zip = new JSZip();
  // loadAsync can throw if not a zip
  const content = await zip.loadAsync(file);

  let totalSize = 0;
  let totalCompressed = 0;

  const files: ArchiveAnalysis['files'] = [];
  let encrypted = false;

  for (const [, entry] of Object.entries(content.files)) {
      // Accessing internal properties because JSZip doesn't expose size easily in public API for synchronous read
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const internal = (entry as any)._data;

      const size = internal?.uncompressedSize || 0;
      const cSize = internal?.compressedSize || 0;
      // Bit 0 of general purpose bit flag indicates encryption
      const isEncrypted = (internal?.bitFlag & 0x0001) === 0x0001;

      if (isEncrypted) encrypted = true;

      totalSize += size;
      totalCompressed += cSize;

      if (files.length < 200) { // Limit to 200 files for UI
          files.push({
              name: entry.name,
              size: size,
              compressedSize: cSize,
              dir: entry.dir
          });
      }
  }

  // If we couldn't read compressed sizes (e.g. different zip format), use file size
  if (totalCompressed === 0) totalCompressed = file.size;

  const ratio = totalCompressed > 0 ? totalSize / totalCompressed : 0;

  return {
      fileCount: Object.keys(content.files).length,
      totalSize,
      compressedSize: totalCompressed,
      compressionRatio: ratio,
      files,
      encrypted
  };
}
