
export async function generateKeyPair(type: 'RSA' | 'ECDSA') {
  if (type === 'RSA') {
    return await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );
  } else {
    return await window.crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      true,
      ["sign", "verify"]
    );
  }
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey(
    key.type === "public" ? "spki" : "pkcs8",
    key
  );

  const exportedAsString = String.fromCharCode(...new Uint8Array(exported));
  const exportedAsBase64 = window.btoa(exportedAsString);
  const pemExported = `-----BEGIN ${key.type === "private" ? "PRIVATE" : "PUBLIC"} KEY-----\n${exportedAsBase64.match(/.{1,64}/g)?.join('\n')}\n-----END ${key.type === "private" ? "PRIVATE" : "PUBLIC"} KEY-----`;

  return pemExported;
}
