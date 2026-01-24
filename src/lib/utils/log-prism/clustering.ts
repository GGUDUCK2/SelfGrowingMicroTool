import type { LogEntry, LogLevel } from './types';

export interface LogCluster {
  id: string;
  signature: string;
  count: number;
  level: LogLevel;
  example: LogEntry;
  entries: LogEntry[];
}

const REGEX_PATTERNS = [
  // IPv4
  { regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, replacement: '{IP}' },
  // ISO Date
  { regex: /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:?\d{2})?/g, replacement: '{DATE}' },
  // Simple Date
  { regex: /\d{4}-\d{2}-\d{2}/g, replacement: '{DATE}' },
  // Time
  { regex: /\d{2}:\d{2}:\d{2}/g, replacement: '{TIME}' },
  // UUID
  { regex: /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, replacement: '{UUID}' },
  // Hex Address
  { regex: /0x[0-9a-fA-F]+/g, replacement: '{HEX}' },
  // Numbers in brackets [123]
  { regex: /\[\d+\]/g, replacement: '[{ID}]' },
  // Mask all numbers (IDs, status codes, etc to group aggressively)
  { regex: /\b\d+\b/g, replacement: '{NUM}' }
];

export function clusterLogs(logs: LogEntry[]): LogCluster[] {
  const clusters = new Map<string, LogCluster>();

  for (const log of logs) {
    let signature = log.message;

    // Apply masks
    for (const p of REGEX_PATTERNS) {
      signature = signature.replace(p.regex, p.replacement);
    }

    // Normalize whitespace
    signature = signature.replace(/\s+/g, ' ').trim();

    // Use Level + Signature as key
    const key = `${log.level}:${signature}`;

    if (!clusters.has(key)) {
      clusters.set(key, {
        id: key,
        signature,
        count: 0,
        level: log.level,
        example: log,
        entries: []
      });
    }

    const cluster = clusters.get(key)!;
    cluster.count++;
    cluster.entries.push(log);
  }

  // Convert to array and sort by count (desc)
  return Array.from(clusters.values()).sort((a, b) => b.count - a.count);
}
