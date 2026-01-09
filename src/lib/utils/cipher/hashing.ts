// src/lib/utils/cipher/hashing.ts

export async function computeHash(
  text: string,
  algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function computeHmac(
  text: string,
  key: string,
  algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const data = encoder.encode(text);

  const importedKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', importedKey, data);
  const signatureArray = Array.from(new Uint8Array(signature));
  const signatureHex = signatureArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return signatureHex;
}
