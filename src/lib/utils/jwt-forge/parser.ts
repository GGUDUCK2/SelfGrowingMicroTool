import type { JwtParts, VerificationResult } from './types';

function base64UrlDecode(str: string): string {
  let output = str.replace(/-/g, '+').replace(/_/g, '/');
  while (output.length % 4) {
    output += '=';
  }

  try {
    const binaryString = atob(output);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (e) {
    console.error('Base64 decode error', e);
    // Fallback for malformed input
    return '';
  }
}

export function parseJwt(token: string): JwtParts {
  const parts = token.split('.');

  // Basic sanity check, though we process even if parts are missing to allow partial typing
  const rawHeader = parts[0] || '';
  const rawPayload = parts[1] || '';
  const rawSignature = parts[2] || '';

  let header = null;
  let payload = null;

  if (rawHeader) {
    try {
      const decoded = base64UrlDecode(rawHeader);
      if (decoded) header = JSON.parse(decoded);
    } catch (e) {
      console.warn('Failed to parse header JSON');
    }
  }

  if (rawPayload) {
    try {
      const decoded = base64UrlDecode(rawPayload);
      if (decoded) payload = JSON.parse(decoded);
    } catch (e) {
      console.warn('Failed to parse payload JSON');
    }
  }

  return {
    header,
    payload,
    signature: rawSignature,
    rawHeader,
    rawPayload,
    rawSignature
  };
}

// Verification Logic (HMAC only for now)
export async function verifySignature(token: string, secret: string): Promise<VerificationResult> {
  const parts = token.split('.');
  if (parts.length !== 3) return { isValid: false, error: 'Invalid structure' };

  const [headerB64, payloadB64, signatureB64] = parts;

  let header;
  try {
    const decoded = base64UrlDecode(headerB64);
    header = JSON.parse(decoded);
  } catch {
    return { isValid: false, error: 'Invalid header' };
  }

  const alg = header.alg;
  if (!alg) return { isValid: false, error: 'No algorithm specified' };
  if (alg === 'none') return { isValid: true }; // Unsecured token

  if (!secret) return { isValid: false, error: 'No secret provided' };

  const encoder = new TextEncoder();
  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  const keyData = encoder.encode(secret);

  let hashAlg = '';
  if (alg === 'HS256') hashAlg = 'SHA-256';
  else if (alg === 'HS384') hashAlg = 'SHA-384';
  else if (alg === 'HS512') hashAlg = 'SHA-512';
  else return { isValid: false, error: `Algorithm ${alg} not supported for client-side verification yet` };

  try {
    const key = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: hashAlg },
      false,
      ['sign']
    );

    const signature = await window.crypto.subtle.sign(
      'HMAC',
      key,
      data
    );

    // Convert signature to base64url
    const signatureArray = Array.from(new Uint8Array(signature));
    // Use btoa safely
    const base64 = btoa(String.fromCharCode(...signatureArray));
    const expectedSignature = base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    if (expectedSignature === signatureB64) {
      return { isValid: true };
    } else {
      return { isValid: false, error: 'Signature mismatch' };
    }
  } catch (e) {
    return { isValid: false, error: 'Verification failed: ' + (e as Error).message };
  }
}
