import { v1, v3, v4, v5, v7, validate as uuidValidate, version as uuidVersion, NIL } from 'uuid';
import { ulid, decodeTime } from 'ulid';
import { nanoid, customAlphabet } from 'nanoid';
import { createId } from '@paralleldrive/cuid2';

export type IdType = 'uuid-v4' | 'uuid-v7' | 'uuid-v1' | 'uuid-v3' | 'uuid-v5' | 'uuid-nil' | 'ulid' | 'nanoid' | 'cuid2';

export interface GenerationOptions {
  type: IdType;
  quantity: number;
  namespace?: string; // For v3, v5
  name?: string; // For v3, v5
  nanoidLength?: number;
  nanoidAlphabet?: string;
  format: 'plain' | 'hyphens' | 'json' | 'sql' | 'guid';
}

const NAMESPACE_DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const NAMESPACE_URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';

export const generateIds = (options: GenerationOptions): string[] => {
  const ids: string[] = [];
  const qty = Math.min(Math.max(1, options.quantity), 10000); // Cap at 10000

  for (let i = 0; i < qty; i++) {
    let id = '';
    try {
      switch (options.type) {
        case 'uuid-v4':
          id = v4();
          break;
        case 'uuid-v7':
          id = v7();
          break;
        case 'uuid-v1':
          id = v1();
          break;
        case 'uuid-v3':
          id = v3(options.name || 'example.com', options.namespace || NAMESPACE_DNS);
          break;
        case 'uuid-v5':
          id = v5(options.name || 'example.com', options.namespace || NAMESPACE_DNS);
          break;
        case 'uuid-nil':
          id = NIL;
          break;
        case 'ulid':
          id = ulid();
          break;
        case 'nanoid':
          if (options.nanoidAlphabet) {
            const nanoidCustom = customAlphabet(options.nanoidAlphabet, options.nanoidLength || 21);
            id = nanoidCustom();
          } else {
            id = nanoid(options.nanoidLength || 21);
          }
          break;
        case 'cuid2':
          id = createId();
          break;
        default:
          id = v4();
      }
    } catch {
      id = 'Error';
    }

    // Post-processing format
    if (options.type.startsWith('uuid')) {
        if (options.format === 'hyphens') {
            // Default UUID is already hyphenated
        } else if (options.format === 'plain') {
            id = id.replace(/-/g, '');
        } else if (options.format === 'guid') {
            id = `{${id.toUpperCase()}}`;
        }
    }

    ids.push(id);
  }
  return ids;
};

export const formatOutput = (ids: string[], format: GenerationOptions['format']): string => {
  if (format === 'json') {
    return JSON.stringify(ids, null, 2);
  }
  if (format === 'sql') {
    return `INSERT INTO ids (id) VALUES \n${ids.map(id => `('${id}')`).join(',\n')};`;
  }
  return ids.join('\n');
};

export interface IdAnalysis {
  isValid: boolean;
  type?: string;
  version?: number;
  timestamp?: Date;
  variant?: string;
  details?: string;
}

export const analyzeId = (id: string): IdAnalysis => {
  const cleanId = id.trim();

  // UUID Check
  if (uuidValidate(cleanId)) {
    const ver = uuidVersion(cleanId);
    let timestamp: Date | undefined = undefined;
    let details = `Standard UUID v${ver}`;

    if (ver === 7) {
        // Extract timestamp from v7
        // v7: 00000000-0000-7000-0000-000000000000
        // First 48 bits (12 hex chars) are timestamp in ms
        const hex = cleanId.replace(/-/g, '');
        const tsHex = hex.substring(0, 12);
        timestamp = new Date(parseInt(tsHex, 16));
        details = "Time-sortable UUID v7";
    } else if (ver === 1) {
        // v1 also has timestamp but scrambled
        // We won't manually decode v1 here for brevity unless requested,
        // as standard tools often just valid it.
        // Actually, let's try a simple extraction if easy.
        // But uuid lib doesn't expose it easily.
        details = "Time-based UUID v1 (Mac Address + Time)";
    }

    return {
      isValid: true,
      type: 'UUID',
      version: ver,
      timestamp,
      details
    };
  }

  // ULID Check (26 chars, Base32)
  const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
  if (ulidRegex.test(cleanId)) {
    let timestamp: Date | undefined;
    try {
        const ts = decodeTime(cleanId);
        timestamp = new Date(ts);
    } catch (e) {
        // Ignore if decode fails
    }

    return {
        isValid: true,
        type: 'ULID',
        timestamp,
        details: 'Universally Unique Lexicographically Sortable Identifier'
    };
  }

  // CUID2 (starts with lowercase letter, variable length usually 24)
  // Hard to validate strictly, but usually alphanumeric.

  return {
    isValid: false,
    details: 'Unknown or Invalid Format'
  };
};

export const calculateCollisionProbability = (length: number, alphabetSize: number, count: number): number => {
    // Approximation: p = 1 - e^(-n^2 / 2d) where n = count, d = alphabet^length
    const d = Math.pow(alphabetSize, length);
    const n = count;
    const exponent = -(n * n) / (2 * d);
    return 1 - Math.exp(exponent);
}
