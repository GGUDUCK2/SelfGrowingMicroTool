export interface MagicPart {
  offset: number;
  pattern: number[];
}

export interface FileSignature {
  type: string;
  category: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'executable' | 'unknown';
  description: string;
  parts: MagicPart[];
}

// Helper to convert hex string "FF D8" or ASCII "WEBP" to number[]
function p(input: string): number[] {
  if (/^[0-9A-Fa-f\s]+$/.test(input)) {
    return input.split(/\s+/).map(h => parseInt(h, 16));
  }
  return input.split('').map(c => c.charCodeAt(0));
}

export const signatures: FileSignature[] = [
  // Images
  { type: 'image/png', category: 'image', description: 'PNG Image', parts: [{ offset: 0, pattern: p('89 50 4E 47 0D 0A 1A 0A') }] },
  { type: 'image/jpeg', category: 'image', description: 'JPEG Image', parts: [{ offset: 0, pattern: p('FF D8 FF') }] },
  { type: 'image/gif', category: 'image', description: 'GIF87a Image', parts: [{ offset: 0, pattern: p('47 49 46 38 37 61') }] },
  { type: 'image/gif', category: 'image', description: 'GIF89a Image', parts: [{ offset: 0, pattern: p('47 49 46 38 39 61') }] },
  { type: 'image/bmp', category: 'image', description: 'BMP Image', parts: [{ offset: 0, pattern: p('42 4D') }] },
  // WebP: RIFF at 0, WEBP at 8
  { type: 'image/webp', category: 'image', description: 'WebP Image', parts: [{ offset: 0, pattern: p('52 49 46 46') }, { offset: 8, pattern: p('WEBP') }] },
  { type: 'image/tiff', category: 'image', description: 'TIFF (LE)', parts: [{ offset: 0, pattern: p('49 49 2A 00') }] },
  { type: 'image/tiff', category: 'image', description: 'TIFF (BE)', parts: [{ offset: 0, pattern: p('4D 4D 00 2A') }] },
  { type: 'image/vnd.microsoft.icon', category: 'image', description: 'ICO Icon', parts: [{ offset: 0, pattern: p('00 00 01 00') }] },

  // Video
  { type: 'video/mp4', category: 'video', description: 'MP4 Video', parts: [{ offset: 4, pattern: p('66 74 79 70') }] }, // ftyp
  { type: 'video/webm', category: 'video', description: 'WebM Video', parts: [{ offset: 0, pattern: p('1A 45 DF A3') }] },
  { type: 'video/mpeg', category: 'video', description: 'MPEG Video', parts: [{ offset: 0, pattern: p('00 00 01 BA') }] },
  { type: 'video/x-ms-wmv', category: 'video', description: 'WMV Video', parts: [{ offset: 0, pattern: p('30 26 B2 75 8E 66 CF 11') }] },

  // Audio
  { type: 'audio/mpeg', category: 'audio', description: 'MP3 Audio (ID3)', parts: [{ offset: 0, pattern: p('49 44 33') }] },
  { type: 'audio/mpeg', category: 'audio', description: 'MP3 Audio', parts: [{ offset: 0, pattern: p('FF FB') }] },
  { type: 'audio/mpeg', category: 'audio', description: 'MP3 Audio', parts: [{ offset: 0, pattern: p('FF F3') }] },
  { type: 'audio/mpeg', category: 'audio', description: 'MP3 Audio', parts: [{ offset: 0, pattern: p('FF F2') }] },
  { type: 'audio/wav', category: 'audio', description: 'WAV Audio', parts: [{ offset: 0, pattern: p('52 49 46 46') }, { offset: 8, pattern: p('WAVE') }] },
  { type: 'audio/ogg', category: 'audio', description: 'Ogg Audio', parts: [{ offset: 0, pattern: p('4F 67 67 53') }] },
  { type: 'audio/flac', category: 'audio', description: 'FLAC Audio', parts: [{ offset: 0, pattern: p('66 4C 61 43') }] },
  { type: 'audio/midi', category: 'audio', description: 'MIDI Audio', parts: [{ offset: 0, pattern: p('4D 54 68 64') }] },

  // Documents
  { type: 'application/pdf', category: 'document', description: 'PDF Document', parts: [{ offset: 0, pattern: p('25 50 44 46') }] },
  { type: 'application/msword', category: 'document', description: 'Legacy Office (DOC/XLS/PPT)', parts: [{ offset: 0, pattern: p('D0 CF 11 E0 A1 B1 1A E1') }] },
  { type: 'application/zip', category: 'archive', description: 'ZIP / Modern Office (DOCX)', parts: [{ offset: 0, pattern: p('50 4B 03 04') }] },

  // Archives
  { type: 'application/x-rar-compressed', category: 'archive', description: 'RAR Archive', parts: [{ offset: 0, pattern: p('52 61 72 21 1A 07 00') }] },
  { type: 'application/x-rar-compressed', category: 'archive', description: 'RAR5 Archive', parts: [{ offset: 0, pattern: p('52 61 72 21 1A 07 01 00') }] },
  { type: 'application/gzip', category: 'archive', description: 'GZIP Archive', parts: [{ offset: 0, pattern: p('1F 8B') }] },
  { type: 'application/x-7z-compressed', category: 'archive', description: '7z Archive', parts: [{ offset: 0, pattern: p('37 7A BC AF 27 1C') }] },
  { type: 'application/x-bzip2', category: 'archive', description: 'BZIP2 Archive', parts: [{ offset: 0, pattern: p('42 5A 68') }] },
  { type: 'application/x-xz', category: 'archive', description: 'XZ Archive', parts: [{ offset: 0, pattern: p('FD 37 7A 58 5A 00') }] },
  { type: 'application/x-tar', category: 'archive', description: 'TAR Archive', parts: [{ offset: 257, pattern: p('75 73 74 61 72') }] },

  // Executables
  { type: 'application/x-dosexec', category: 'executable', description: 'DOS/Windows Executable', parts: [{ offset: 0, pattern: p('4D 5A') }] },
  { type: 'application/x-elf', category: 'executable', description: 'ELF Executable', parts: [{ offset: 0, pattern: p('7F 45 4C 46') }] },
  { type: 'application/java-vm', category: 'executable', description: 'Java Class / Mach-O Fat', parts: [{ offset: 0, pattern: p('CA FE BA BE') }] },
  { type: 'application/x-mach-binary', category: 'executable', description: 'Mach-O Binary (macOS)', parts: [{ offset: 0, pattern: p('CF FA ED FE') }] },

  // Fonts
  { type: 'font/ttf', category: 'unknown', description: 'TrueType Font', parts: [{ offset: 0, pattern: p('00 01 00 00') }] },
  { type: 'font/otf', category: 'unknown', description: 'OpenType Font', parts: [{ offset: 0, pattern: p('4F 54 54 4F') }] },
  { type: 'font/woff', category: 'unknown', description: 'WOFF Font', parts: [{ offset: 0, pattern: p('77 4F 46 46') }] },
  { type: 'font/woff2', category: 'unknown', description: 'WOFF2 Font', parts: [{ offset: 0, pattern: p('77 4F 46 32') }] },
];

export function detectFileType(buffer: ArrayBuffer): { type: string; category: string; description: string; matches: boolean } {
  const view = new Uint8Array(buffer);

  for (const sig of signatures) {
    let match = true;
    for (const part of sig.parts) {
      if (!matchPattern(view, part.offset, part.pattern)) {
        match = false;
        break;
      }
    }

    if (match) {
      return {
        type: sig.type,
        category: sig.category,
        description: sig.description,
        matches: true
      };
    }
  }

  return { type: 'Unknown', category: 'unknown', description: 'Unknown File Type', matches: false };
}

function matchPattern(view: Uint8Array, offset: number, pattern: number[]): boolean {
  if (view.length < offset + pattern.length) return false;
  for (let i = 0; i < pattern.length; i++) {
    if (view[offset + i] !== pattern[i]) return false;
  }
  return true;
}
