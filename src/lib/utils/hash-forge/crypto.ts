import CryptoJS from 'crypto-js';

export const ALGORITHMS = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512', 'SHA-3'] as const;
export type HashAlgorithm = typeof ALGORITHMS[number];
export type InputFormat = 'text' | 'hex' | 'base64';

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

function parseInputData(input: string, format: InputFormat): ArrayBuffer {
  if (format === 'hex') {
    const cleanHex = input.replace(/[^0-9a-fA-F]/g, '');
    const buffer = new ArrayBuffer(Math.ceil(cleanHex.length / 2));
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16);
    }
    return buffer;
  } else if (format === 'base64') {
    try {
      const binaryString = atob(input);
      const buffer = new ArrayBuffer(binaryString.length);
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return buffer;
    } catch {
      // Fallback if invalid base64
      return new TextEncoder().encode(input).buffer as ArrayBuffer;
    }
  } else {
    return new TextEncoder().encode(input).buffer as ArrayBuffer;
  }
}

function getCryptoJsWordarray(input: string, format: InputFormat) {
  if (format === 'hex') {
    return CryptoJS.enc.Hex.parse(input.replace(/[^0-9a-fA-F]/g, ''));
  } else if (format === 'base64') {
    try {
      return CryptoJS.enc.Base64.parse(input);
    } catch {
      return CryptoJS.enc.Utf8.parse(input);
    }
  } else {
    return CryptoJS.enc.Utf8.parse(input);
  }
}

export async function hashText(text: string, algorithm: HashAlgorithm, format: InputFormat = 'text'): Promise<HashResult> {
  // Use Web Crypto API if possible for performance
  if (algorithm !== 'MD5' && algorithm !== 'SHA-3') {
    const data = parseInputData(text, format);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    return {
      hex: bufferToHex(hashBuffer),
      base64: bufferToBase64(hashBuffer),
      algorithm
    };
  }

  // Fallback to CryptoJS for MD5 and SHA-3
  let hash;
  const wordarray = getCryptoJsWordarray(text, format);
  switch (algorithm) {
    case 'MD5': hash = CryptoJS.MD5(wordarray); break;
    case 'SHA-3': hash = CryptoJS.SHA3(wordarray); break;
    default: throw new Error('Unsupported algorithm');
  }
  return {
    hex: hash.toString(CryptoJS.enc.Hex),
    base64: hash.toString(CryptoJS.enc.Base64),
    algorithm
  };
}

export async function generateHmac(message: string, secret: string, algorithm: HashAlgorithm, messageFormat: InputFormat = 'text', secretFormat: InputFormat = 'text'): Promise<HashResult> {
  if (algorithm !== 'MD5' && algorithm !== 'SHA-3') {
    const keyData = parseInputData(secret, secretFormat);
    const messageData = parseInputData(message, messageFormat);

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
  const messageWordarray = getCryptoJsWordarray(message, messageFormat);
  // CryptoJS.Hmac* functions expect the secret to be a string or WordArray.
  // Using WordArray for consistency
  const secretWordarray = getCryptoJsWordarray(secret, secretFormat);

  switch (algorithm) {
    case 'MD5': hmac = CryptoJS.HmacMD5(messageWordarray, secretWordarray); break;
    case 'SHA-3': hmac = CryptoJS.HmacSHA3(messageWordarray, secretWordarray); break;
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
        const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(arrayBuffer));

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

      reader.onerror = function() {
        reject(reader.error);
      };

      reader.readAsArrayBuffer(slice);
    }

    readNextChunk();
  });
}
