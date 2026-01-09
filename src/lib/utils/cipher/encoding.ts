// src/lib/utils/cipher/encoding.ts

export function toBase64(text: string): string {
  try {
    return btoa(text);
  } catch (e) {
    // Handle Unicode strings
    return btoa(
      encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );
  }
}

export function fromBase64(text: string): string {
  try {
    const decoded = atob(text);
    try {
      // Handle Unicode strings
      return decodeURIComponent(
        Array.from(decoded)
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch {
      return decoded;
    }
  } catch (e) {
    return 'Invalid Base64 string';
  }
}

export function toUrlEncode(text: string): string {
  return encodeURIComponent(text);
}

export function fromUrlEncode(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch (e) {
    return 'Invalid URL Encoded string';
  }
}

export function toHex(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += text.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return result;
}

export function fromHex(text: string): string {
  const hex = text.toString().replace(/\s/g, ''); // clean spaces
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
}

export function toBinary(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += text.charCodeAt(i).toString(2).padStart(8, '0') + ' ';
  }
  return result.trim();
}

export function fromBinary(text: string): string {
  const bin = text.replace(/\s/g, '');
  let str = '';
  for (let i = 0; i < bin.length; i += 8) {
    str += String.fromCharCode(parseInt(bin.substr(i, 8), 2));
  }
  return str;
}

export function toHtmlEntity(text: string): string {
  return text.replace(/[\u00A0-\u9999<>\&]/g, function (i) {
    return '&#' + i.charCodeAt(0) + ';';
  });
}

export function fromHtmlEntity(text: string): string {
  const txt = document.createElement('textarea');
  txt.innerHTML = text;
  return txt.value;
}
