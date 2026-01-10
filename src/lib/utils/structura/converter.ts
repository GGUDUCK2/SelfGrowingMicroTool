import yaml from 'js-yaml';
import { js2xml, xml2js } from 'xml-js';
import Papa from 'papaparse';

export type Format = 'json' | 'yaml' | 'xml' | 'csv';

export interface ConvertOptions {
  indent: number; // 2 or 4
  csvDelimiter?: string;
  xmlFullTag?: boolean; // For XML parsing (compact or non-compact)
}

export interface ConvertResult {
  data: string;
  error?: string;
}

/**
 * Normalizes input string to a JavaScript Object/Array.
 */
const parseInput = (input: string, format: Format): unknown => {
  if (!input.trim()) return null;

  switch (format) {
    case 'json':
      try {
        return JSON.parse(input);
      } catch (e) {
        throw new Error(`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`);
      }
    case 'yaml':
      try {
        const res = yaml.load(input);
        return res;
      } catch (e) {
        throw new Error(`Invalid YAML: ${e instanceof Error ? e.message : String(e)}`);
      }
    case 'xml':
      try {
        // xml2js returns a JS object representation of XML
        const result = xml2js(input, { compact: true, ignoreComment: true, nativeType: true });
        return result;
      } catch (e) {
        throw new Error(`Invalid XML: ${e instanceof Error ? e.message : String(e)}`);
      }
    case 'csv':
      // PapaParse returns { data: any[], meta: ... }
      const result = Papa.parse(input, { header: true, dynamicTyping: true, skipEmptyLines: true });
      if (result.errors && result.errors.length > 0) {
        throw new Error(`Invalid CSV: ${result.errors[0].message}`);
      }
      return result.data;
    default:
      throw new Error(`Unsupported input format: ${format}`);
  }
};

/**
 * Stringifies a JavaScript Object/Array to the target format.
 */
const stringifyOutput = (data: unknown, format: Format, options: ConvertOptions): string => {
  if (data === null || data === undefined) return '';

  switch (format) {
    case 'json':
      return JSON.stringify(data, null, options.indent);
    case 'yaml':
      return yaml.dump(data, { indent: options.indent });
    case 'xml':
      // data needs to be in a format xml-js accepts.
      // If converting from JSON/CSV to XML, we might need to wrap in a root element if it's an array or doesn't have a single root.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let xmlData: any = data;
      // Simple heuristic: if it's an array, wrap in <root><item>...</item></root>
      if (Array.isArray(data)) {
        xmlData = { root: { item: data } };
      } else if (typeof data === 'object' && data !== null && Object.keys(data).length > 1) {
        // If object has multiple keys, it lacks a single root, wrap it.
        xmlData = { root: data };
      }

      return js2xml(xmlData, { compact: true, spaces: options.indent });
    case 'csv':
      // Papa.unparse expects array of objects or array of arrays
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return Papa.unparse(data as any, { delimiter: options.csvDelimiter || ',' });
    default:
      throw new Error(`Unsupported output format: ${format}`);
  }
};

export const convertData = (input: string, inputFormat: Format, outputFormat: Format, options: ConvertOptions = { indent: 2 }): ConvertResult => {
  try {
    const parsed = parseInput(input, inputFormat);
    const output = stringifyOutput(parsed, outputFormat, options);
    return { data: output };
  } catch (err) {
    return { data: '', error: err instanceof Error ? err.message : String(err) };
  }
};

export const detectFormat = (input: string): Format => {
  const trimmed = input.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json';
  if (trimmed.startsWith('<')) return 'xml';
  if (trimmed.includes('---')) return 'yaml'; // Simple heuristic
  // CSV is harder, usually relies on user selection or failing others.
  // We'll default to JSON if ambiguous or let user decide.
  // But let's check for simple comma separated structure
  if (trimmed.split('\n')[0].includes(',')) return 'csv';

  // Fallback checks
  try {
    JSON.parse(trimmed);
    return 'json';
  } catch {
    // ignore
  }

  try {
    yaml.load(trimmed);
    return 'yaml';
  } catch {
    // ignore
  }

  return 'json'; // Default
};
