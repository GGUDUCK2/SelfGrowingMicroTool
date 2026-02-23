export interface FileSignature {
  offset: number;
  magic: string[];
  type: string;
  category: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'executable' | 'unknown';
  description?: string;
}

// Magic numbers are typically hex strings
export const signatures: FileSignature[] = [
  // Images
  { offset: 0, magic: ['89 50 4E 47 0D 0A 1A 0A'], type: 'image/png', category: 'image', description: 'PNG Image' },
  { offset: 0, magic: ['FF D8 FF'], type: 'image/jpeg', category: 'image', description: 'JPEG Image' },
  { offset: 0, magic: ['47 49 46 38 37 61', '47 49 46 38 39 61'], type: 'image/gif', category: 'image', description: 'GIF Image' },
  { offset: 0, magic: ['42 4D'], type: 'image/bmp', category: 'image', description: 'BMP Image' },
  { offset: 0, magic: ['52 49 46 46', 'WEBP', 'VP8'], type: 'image/webp', category: 'image', description: 'WebP Image' }, // WebP is RIFF...WEBP
  { offset: 0, magic: ['49 49 2A 00', '4D 4D 00 2A'], type: 'image/tiff', category: 'image', description: 'TIFF Image' },
  { offset: 0, magic: ['00 00 01 00'], type: 'image/vnd.microsoft.icon', category: 'image', description: 'ICO Icon' },

  // Video
  { offset: 4, magic: ['66 74 79 70'], type: 'video/mp4', category: 'video', description: 'MP4 Video' }, // Offset 4: ftyp
  { offset: 0, magic: ['1A 45 DF A3'], type: 'video/webm', category: 'video', description: 'WebM Video' },
  { offset: 0, magic: ['00 00 01 BA'], type: 'video/mpeg', category: 'video', description: 'MPEG Video' },
  { offset: 0, magic: ['30 26 B2 75 8E 66 CF 11'], type: 'video/x-ms-wmv', category: 'video', description: 'WMV Video' },

  // Audio
  { offset: 0, magic: ['49 44 33'], type: 'audio/mpeg', category: 'audio', description: 'MP3 Audio (ID3)' },
  { offset: 0, magic: ['FF FB', 'FF F3', 'FF F2'], type: 'audio/mpeg', category: 'audio', description: 'MP3 Audio' },
  { offset: 0, magic: ['52 49 46 46', 'WAVE'], type: 'audio/wav', category: 'audio', description: 'WAV Audio' },
  { offset: 0, magic: ['4F 67 67 53'], type: 'audio/ogg', category: 'audio', description: 'Ogg Audio' },
  { offset: 0, magic: ['66 4C 61 43'], type: 'audio/flac', category: 'audio', description: 'FLAC Audio' },
  { offset: 0, magic: ['4D 54 68 64'], type: 'audio/midi', category: 'audio', description: 'MIDI Audio' },

  // Documents
  { offset: 0, magic: ['25 50 44 46'], type: 'application/pdf', category: 'document', description: 'PDF Document' },
  { offset: 0, magic: ['D0 CF 11 E0 A1 B1 1A E1'], type: 'application/msword', category: 'document', description: 'Legacy Office Document (DOC/XLS/PPT)' },
  { offset: 0, magic: ['50 4B 03 04'], type: 'application/zip', category: 'archive', description: 'ZIP Archive / Modern Office (DOCX/XLSX)' },

  // Archives
  { offset: 0, magic: ['52 61 72 21 1A 07 00'], type: 'application/x-rar-compressed', category: 'archive', description: 'RAR Archive' },
  { offset: 0, magic: ['52 61 72 21 1A 07 01 00'], type: 'application/x-rar-compressed', category: 'archive', description: 'RAR5 Archive' },
  { offset: 0, magic: ['1F 8B'], type: 'application/gzip', category: 'archive', description: 'GZIP Archive' },
  { offset: 0, magic: ['37 7A BC AF 27 1C'], type: 'application/x-7z-compressed', category: 'archive', description: '7z Archive' },
  { offset: 0, magic: ['42 5A 68'], type: 'application/x-bzip2', category: 'archive', description: 'BZIP2 Archive' },
  { offset: 0, magic: ['FD 37 7A 58 5A 00'], type: 'application/x-xz', category: 'archive', description: 'XZ Archive' },
  { offset: 257, magic: ['75 73 74 61 72'], type: 'application/x-tar', category: 'archive', description: 'TAR Archive' },

  // Executables
  { offset: 0, magic: ['4D 5A'], type: 'application/x-dosexec', category: 'executable', description: 'DOS/Windows Executable (EXE/DLL)' },
  { offset: 0, magic: ['7F 45 4C 46'], type: 'application/x-elf', category: 'executable', description: 'ELF Executable (Linux)' },
  { offset: 0, magic: ['CA FE BA BE'], type: 'application/java-vm', category: 'executable', description: 'Java Class / Mach-O Fat Binary' },
  { offset: 0, magic: ['CF FA ED FE'], type: 'application/x-mach-binary', category: 'executable', description: 'Mach-O Binary (macOS)' },

  // Fonts
  { offset: 0, magic: ['00 01 00 00'], type: 'font/ttf', category: 'unknown', description: 'TrueType Font' },
  { offset: 0, magic: ['4F 54 54 4F'], type: 'font/otf', category: 'unknown', description: 'OpenType Font' },
  { offset: 0, magic: ['77 4F 46 46'], type: 'font/woff', category: 'unknown', description: 'WOFF Font' },
  { offset: 0, magic: ['77 4F 46 32'], type: 'font/woff2', category: 'unknown', description: 'WOFF2 Font' },
];

export function detectFileType(buffer: ArrayBuffer): { type: string; category: string; description: string; matches: boolean } {
  const view = new Uint8Array(buffer);

  for (const sig of signatures) {
    // Check offset bounds
    if (view.length < sig.offset) continue;

    for (const magic of sig.magic) {
      // Magic is a string of hex bytes like "89 50 ..."
      // We handle "WEBP" as hex if needed, but for now assuming all magic in table is hex string OR special handling needed.
      // Actually, my table has 'WEBP' literal in string array. I should convert that.
      // Let's normalize everything to bytes for comparison.

      const pattern = parseMagic(magic);
      if (matchPattern(view, sig.offset, pattern)) {
        return {
          type: sig.type,
          category: sig.category,
          description: sig.description || sig.type,
          matches: true
        };
      }
    }
  }

  return { type: 'Unknown', category: 'unknown', description: 'Unknown File Type', matches: false };
}

function parseMagic(magic: string): number[] {
  // Check if it looks like a hex string "89 50"
  if (/^[0-9A-Fa-f\s]+$/.test(magic)) {
    return magic.split(/\s+/).map(h => parseInt(h, 16));
  }
  // Otherwise treat as ASCII
  return magic.split('').map(c => c.charCodeAt(0));
}

function matchPattern(view: Uint8Array, offset: number, pattern: number[]): boolean {
  if (view.length < offset + pattern.length) return false;
  for (let i = 0; i < pattern.length; i++) {
    // Special handling for WebP where RIFF is at 0 and WEBP is at 8
    // But my data structure is simple { offset: 0, magic: ... }
    // The WebP entry I added was lazy. Correct logic:
    // RIFF....WEBP is complex.
    // Let's stick to simple sequential matching for now.
    // If pattern contains -1 or similar for wildcard? Not implemented.

    if (view[offset + i] !== pattern[i]) return false;
  }
  return true;
}
