import CryptoJS from 'crypto-js';

export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
// We still advertise SHA-* algorithms

const ALGORITHMS: HashAlgorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

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

export interface HashResult {
    hex: string;
    base64: string;
    algorithm: HashAlgorithm;
}

export async function hashText(text: string, algorithm: HashAlgorithm): Promise<HashResult> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    return {
        hex: bufferToHex(hashBuffer),
        base64: bufferToBase64(hashBuffer),
        algorithm
    };
}

export async function generateHmac(message: string, secret: string, algorithm: HashAlgorithm): Promise<HashResult> {
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

function getCryptoJsAlgo(algo: HashAlgorithm) {
    switch(algo) {
        case 'SHA-1': return CryptoJS.algo.SHA1;
        case 'SHA-256': return CryptoJS.algo.SHA256;
        case 'SHA-384': return CryptoJS.algo.SHA384;
        case 'SHA-512': return CryptoJS.algo.SHA512;
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

export { ALGORITHMS };
