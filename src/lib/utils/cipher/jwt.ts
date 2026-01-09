// src/lib/utils/cipher/jwt.ts

export interface ParsedJWT {
  header: any;
  payload: any;
  signature: string;
  raw: {
    header: string;
    payload: string;
    signature: string;
  };
}

export function parseJwt(token: string): ParsedJWT | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')));
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));

    return {
      header,
      payload,
      signature: signatureB64,
      raw: {
        header: headerB64,
        payload: payloadB64,
        signature: signatureB64
      }
    };
  } catch (e) {
    return null;
  }
}

export async function verifyJwtSignature(token: string, secret: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [headerB64, payloadB64, signatureB64] = parts;
    const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')));

    // We only support HMAC verification here
    const alg = header.alg;
    if (!['HS256', 'HS384', 'HS512'].includes(alg)) {
      return false; // Unsupported or asymmetric algo
    }

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const data = encoder.encode(`${headerB64}.${payloadB64}`);

    const hashAlgo = alg === 'HS256' ? 'SHA-256' : alg === 'HS384' ? 'SHA-384' : 'SHA-512';

    const importedKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: hashAlgo },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', importedKey, data);

    // Convert signature to Base64Url
    const signatureArray = Array.from(new Uint8Array(signature));
    const calculatedSignatureB64 = btoa(String.fromCharCode.apply(null, signatureArray))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return signatureB64 === calculatedSignatureB64;

  } catch (e) {
    console.error(e);
    return false;
  }
}
