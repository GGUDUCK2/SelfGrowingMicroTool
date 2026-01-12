export interface TextStats {
  chars: number;
  charsNoSpace: number;
  words: number;
  lines: number;
  paragraphs: number;
  bytes: number;
  readingTime: number; // in seconds
  speakingTime: number; // in seconds
  sentences: number;
}

export interface CharFrequency {
  char: string;
  count: number;
  percentage: number;
}

export type TransformMode =
  | 'uppercase' | 'lowercase' | 'capitalize' | 'camelCase'
  | 'pascalCase' | 'snakeCase' | 'kebabCase' | 'constantCase'
  | 'dotCase' | 'pathCase' | 'sentenceCase' | 'titleCase'
  | 'alternatingCase' | 'inverseCase' | 'slugify'
  | 'reverse' | 'reverseWords' | 'shuffleLines' | 'sortLinesAlpha'
  | 'sortLinesLength' | 'uniqueLines';

export type CleanMode =
  | 'trim' | 'trimLines' | 'removeEmptyLines' | 'removeDuplicateLines'
  | 'normalizeSpace' | 'stripHtml' | 'stripPunctuation' | 'removeNumbers';

export type SecurityMode =
  | 'redactEmail' | 'redactPhone' | 'redactIp' | 'redactCreditCard';

export type EncodeMode =
  | 'base64Encode' | 'base64Decode' | 'urlEncode' | 'urlDecode'
  | 'htmlEntityEncode' | 'htmlEntityDecode' | 'hexEncode' | 'hexDecode'
  | 'binaryEncode' | 'binaryDecode';
