// src/lib/utils/cipher/encryption.ts

export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(text: string, password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    enc.encode(text)
  );

  // Combine Salt + IV + Ciphertext
  const buffer = new Uint8Array(salt.byteLength + iv.byteLength + encrypted.byteLength);
  buffer.set(salt, 0);
  buffer.set(iv, salt.byteLength);
  buffer.set(new Uint8Array(encrypted), salt.byteLength + iv.byteLength);

  // Encode as Base64
  return btoa(String.fromCharCode(...buffer));
}

export async function decryptData(encryptedBase64: string, password: string): Promise<string> {
  const binaryString = atob(encryptedBase64);
  const buffer = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    buffer[i] = binaryString.charCodeAt(i);
  }

  // Extract Salt (16 bytes) and IV (12 bytes)
  const salt = buffer.slice(0, 16);
  const iv = buffer.slice(16, 28);
  const ciphertext = buffer.slice(28);

  const key = await deriveKey(password, salt);

  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (e) {
    throw new Error('Decryption failed. Wrong password or corrupted data.');
  }
}
