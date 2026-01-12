import type { CleanMode, SecurityMode, EncodeMode } from './types';

export class TextCleaner {
  static clean(text: string, mode: CleanMode): string {
    switch (mode) {
      case 'trim': return text.trim();
      case 'trimLines': return text.split('\n').map(l => l.trim()).join('\n');
      case 'removeEmptyLines': return text.split('\n').filter(l => l.trim() !== '').join('\n');
      case 'removeDuplicateLines': return [...new Set(text.split('\n'))].join('\n');
      case 'normalizeSpace': return text.replace(/\s+/g, ' ');
      case 'stripHtml': return text.replace(/<[^>]*>?/gm, '');
      case 'stripPunctuation': return text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
      case 'removeNumbers': return text.replace(/\d+/g, '');
      default: return text;
    }
  }

  static redact(text: string, mode: SecurityMode): string {
    switch (mode) {
      case 'redactEmail':
        return text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL REDACTED]');
      case 'redactPhone':
        return text.replace(/(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?/g, '[PHONE REDACTED]');
      case 'redactIp':
        return text.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[IP REDACTED]');
      case 'redactCreditCard':
        return text.replace(/\b(?:\d[ -]*?){13,16}\b/g, '[CC REDACTED]');
      default: return text;
    }
  }

  static encode(text: string, mode: EncodeMode): string {
    try {
      switch (mode) {
        case 'base64Encode': return btoa(text);
        case 'base64Decode': return atob(text);
        case 'urlEncode': return encodeURIComponent(text);
        case 'urlDecode': return decodeURIComponent(text);
        case 'htmlEntityEncode': return text.replace(/[\u00A0-\u9999<>\&]/g, i => '&#'+i.charCodeAt(0)+';');
        case 'htmlEntityDecode': return text.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
        case 'hexEncode': return text.split('').map(c => c.charCodeAt(0).toString(16)).join(' ');
        case 'hexDecode': return text.split(' ').map(c => String.fromCharCode(parseInt(c, 16))).join('');
        case 'binaryEncode': return text.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
        case 'binaryDecode': return text.split(' ').map(b => String.fromCharCode(parseInt(b, 2))).join('');
        default: return text;
      }
    } catch (e) {
      return 'Error: Invalid input for this encoding/decoding operation.';
    }
  }
}
