import { type FileSignature, detectFileType } from './signatures';

export interface AnalysisResult {
  entropy: number;
  entropyMap: number[];
  riskScore: number;
  riskFactors: string[];
  magic: { type: string; category: string; description: string; matches: boolean };
}

// Shannon Entropy Calculation
export function calculateEntropy(data: Uint8Array): number {
  const frequencies = new Array(256).fill(0);
  for (let i = 0; i < data.length; i++) {
    frequencies[data[i]]++;
  }

  let entropy = 0;
  const len = data.length;
  for (let i = 0; i < 256; i++) {
    if (frequencies[i] > 0) {
      const p = frequencies[i] / len;
      entropy -= p * Math.log2(p);
    }
  }
  return entropy;
}

// Generate Entropy Map (Heatmap)
// Divides file into chunks and calculates entropy for each
export async function calculateEntropyMap(file: File, chunks = 100): Promise<number[]> {
  const map: number[] = [];
  const chunkSize = Math.floor(file.size / chunks);
  if (chunkSize === 0) return [calculateEntropy(new Uint8Array(await file.arrayBuffer()))];

  // We can't read the whole file at once if it's huge.
  // We'll read specific chunks.

  const step = Math.max(1, Math.floor(file.size / chunks));

  // Sample 100 chunks evenly distributed
  for (let i = 0; i < chunks; i++) {
    const start = i * step;
    const end = Math.min(start + 4096, file.size); // Read up to 4KB per chunk sample
    if (start >= file.size) break;

    const blob = file.slice(start, end);
    const buffer = await blob.arrayBuffer();
    map.push(calculateEntropy(new Uint8Array(buffer)));
  }

  return map;
}

// Calculate Risk Score (0-100)
// 0 = Safe, 100 = Dangerous
export function calculateRiskScore(file: File, magic: { type: string, matches: boolean }, entropy: number): { score: number, factors: string[] } {
  let score = 0;
  const factors: string[] = [];

  // 1. Double Extension Check
  if (/\.[a-z0-9]+\.(exe|bat|cmd|sh|vbs|js)$/i.test(file.name)) {
    score += 80;
    factors.push('Suspicious double extension (e.g., .txt.exe)');
  }

  // 2. Magic Number Mismatch
  if (magic.matches && magic.type !== 'Unknown') {
    // Basic MIME type check vs Magic
    // Note: file.type comes from OS/Browser based on extension usually
    if (file.type && !file.type.includes(magic.type) && !magic.type.includes(file.type)) {
       // Allow some fuzzy matching (e.g. x-zip-compressed vs zip)
       const extType = file.type.split('/')[1];
       const magicTypeParts = magic.type.split('/');
       if (!magicTypeParts[1]?.includes(extType) && !extType?.includes(magicTypeParts[1])) {
           score += 30;
           factors.push(`Extension mismatch: File claims to be ${file.type} but signature is ${magic.type}`);
       }
    }
  } else if (!magic.matches) {
      score += 10;
      factors.push('Unknown file signature');
  }

  // 3. High Entropy in non-compressed files
  // Text files usually have entropy < 5. Compressed/Encrypted > 7.5.
  const textTypes = ['text/plain', 'text/html', 'application/json', 'image/svg+xml'];
  if (textTypes.includes(file.type) && entropy > 7) {
      score += 50;
      factors.push('Abnormally high entropy for a text file (Possible hidden code or encryption)');
  }

  // 4. Executable masquerading
  if (magic.type.includes('executable') || magic.type.includes('dosexec')) {
      if (!file.name.endsWith('.exe') && !file.name.endsWith('.dll')) {
          score += 90;
          factors.push('Executable code detected in non-executable file');
      } else {
          score += 20; // It is an executable, inherent risk
          factors.push('File contains executable code');
      }
  }

  return { score: Math.min(100, score), factors };
}
