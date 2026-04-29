import CryptoJS from 'crypto-js';

export const ALGORITHMS = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512', 'SHA-3'] as const;
export type HashAlgorithm = typeof ALGORITHMS[number];

export interface HashResult {
  hex: string;
  base64: string;
  algorithm: HashAlgorithm;
}

function bufferToHex(buffer: ArrayBuffer): string {
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function hashText(text: string, algorithm: HashAlgorithm): Promise<HashResult> {
  // Use Web Crypto API if possible for performance
  if (algorithm !== 'MD5' && algorithm !== 'SHA-3') {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    return {
      hex: bufferToHex(hashBuffer),
      base64: bufferToBase64(hashBuffer),
      algorithm
    };
  }

  // Fallback to CryptoJS for MD5 and SHA-3
  let hash;
  switch (algorithm) {
    case 'MD5': hash = CryptoJS.MD5(text); break;
    case 'SHA-3': hash = CryptoJS.SHA3(text); break;
    default: throw new Error('Unsupported algorithm');
  }
  return {
    hex: hash.toString(CryptoJS.enc.Hex),
    base64: hash.toString(CryptoJS.enc.Base64),
    algorithm
  };
}

export async function generateHmac(message: string, secret: string, algorithm: HashAlgorithm): Promise<HashResult> {
  if (algorithm !== 'MD5' && algorithm !== 'SHA-3') {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(message);

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: algorithm },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, messageData);

    return {
      hex: bufferToHex(signature),
      base64: bufferToBase64(signature),
      algorithm
    };
  }

  let hmac;
  switch (algorithm) {
    case 'MD5': hmac = CryptoJS.HmacMD5(message, secret); break;
    case 'SHA-3': hmac = CryptoJS.HmacSHA3(message, secret); break;
    default: throw new Error('Unsupported algorithm');
  }
  return {
    hex: hmac.toString(CryptoJS.enc.Hex),
    base64: hmac.toString(CryptoJS.enc.Base64),
    algorithm
  };
}

function getCryptoJsAlgo(algo: HashAlgorithm) {
  switch(algo) {
    case 'MD5': return CryptoJS.algo.MD5;
    case 'SHA-1': return CryptoJS.algo.SHA1;
    case 'SHA-256': return CryptoJS.algo.SHA256;
    case 'SHA-384': return CryptoJS.algo.SHA384;
    case 'SHA-512': return CryptoJS.algo.SHA512;
    case 'SHA-3': return CryptoJS.algo.SHA3;
    default: throw new Error('Unsupported algorithm');
  }
}

export function hashFileChunked(
  file: File,
  algorithm: HashAlgorithm,
  onProgress: (progress: number) => void
): Promise<HashResult> {
  return new Promise((resolve, reject) => {
    const chunkSize = 2 * 1024 * 1024; // 2MB chunks
    const fileSize = file.size;
    let offset = 0;

    const algoFn = getCryptoJsAlgo(algorithm);
    const hasher = algoFn.create();

    function readNextChunk() {
      const slice = file.slice(offset, offset + chunkSize);
      const reader = new FileReader();

      reader.onload = function(e) {
        if (!e.target || !e.target.result) return reject(new Error('Failed to read chunk'));

        // Convert ArrayBuffer to CryptoJS WordArray
        const arrayBuffer = e.target.result as ArrayBuffer;
        const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(arrayBuffer) as any);

        hasher.update(wordArray);

        offset += slice.size;

        // Report progress
        const progress = Math.min(100, Math.round((offset / fileSize) * 100));
        onProgress(progress);

        if (offset < fileSize) {
          // Prevent blocking the main thread too aggressively
          setTimeout(readNextChunk, 0);
        } else {
          const hashResult = hasher.finalize();

          resolve({
            hex: hashResult.toString(CryptoJS.enc.Hex),
            base64: hashResult.toString(CryptoJS.enc.Base64),
            algorithm
          });
        }
      };

      reader.onerror = function(e) {
        reject(reader.error);
      };

      reader.readAsArrayBuffer(slice);
    }

    readNextChunk();
  });
}
