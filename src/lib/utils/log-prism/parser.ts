import { nanoid } from 'nanoid';
import type { LogEntry, LogLevel } from './types';

// Patterns
const PATTERNS = {
    // Nginx Combined: 127.0.0.1 - - [10/Oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326
    NGINX: /^(\S+) (\S+) (\S+) \[([\w:/]+\s[+\-]\d{4})\] "(\S+) (\S+)\s*(\S+)?" (\d{3}) (\d+)(?: "(.*?)")?(?: "(.*?)")?/,
    // ISO8601 Start: 2023-01-01T10:00:00Z ...
    ISO: /^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:?\d{2})?)\s+([A-Z]+)\s+(.*)/i,
    // Syslog: Oct 11 22:14:15 ...
    SYSLOG: /^([A-Z][a-z]{2}\s+\d+\s\d{2}:\d{2}:\d{2})\s+(\S+)\s+(.*)/,
    // Simple Level: [INFO] ...
    SIMPLE: /^\[([A-Z]+)\]\s+(.*)/i
};

export function parseLogs(raw: string): LogEntry[] {
    const lines = raw.split(/\r?\n/);
    const entries: LogEntry[] = [];

    // Detect format based on first few lines?
    // For now, we try matching line by line.

    for (const line of lines) {
        if (!line.trim()) continue;
        entries.push(parseLine(line));
    }

    return entries;
}

function parseLine(line: string): LogEntry {
    const entry: LogEntry = {
        id: nanoid(),
        timestamp: null,
        level: 'unknown',
        message: line,
        metadata: {},
        raw: line
    };

    try {
        // Try JSON first
        if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
            try {
                const json = JSON.parse(line);
                entry.metadata = json;

                // Extract common fields
                if (json.time || json.timestamp || json.date) {
                    entry.timestamp = new Date(json.time || json.timestamp || json.date);
                }
                if (json.level || json.severity) {
                    entry.level = normalizeLevel(json.level || json.severity);
                }
                if (json.msg || json.message) {
                    entry.message = json.msg || json.message;
                }
                return entry;
            } catch (e) {
                // Not valid JSON, continue
            }
        }

        // Try Nginx
        const nginxMatch = line.match(PATTERNS.NGINX);
        if (nginxMatch) {
            // [4] is timestamp: 10/Oct/2000:13:55:36 -0700
            const tsStr = nginxMatch[4];
            // Custom parse needed for this format usually, but let's try strict date parsing or manual
            // date-fns parse: dd/MMM/yyyy:HH:mm:ss X
            try {
                 // Manual replacement to make it parsable by Date() often works better for browser consistency
                 // 10/Oct/2000:13:55:36 -0700 -> 10 Oct 2000 13:55:36 -0700
                 const cleanTs = tsStr.replace(':', ' ');
                 entry.timestamp = new Date(cleanTs);
            } catch {}

            entry.level = 'info'; // Nginx access logs are usually info
            const status = parseInt(nginxMatch[8]);
            if (status >= 400) entry.level = 'warn';
            if (status >= 500) entry.level = 'error';

            entry.message = `${nginxMatch[5]} ${nginxMatch[6]} (${status})`;
            entry.metadata = {
                ip: nginxMatch[1],
                user: nginxMatch[3],
                method: nginxMatch[5],
                path: nginxMatch[6],
                status: status,
                size: nginxMatch[9],
                referrer: nginxMatch[10],
                agent: nginxMatch[11]
            };
            return entry;
        }

        // Try ISO
        const isoMatch = line.match(PATTERNS.ISO);
        if (isoMatch) {
            entry.timestamp = new Date(isoMatch[1]);
            entry.level = normalizeLevel(isoMatch[2]);
            entry.message = isoMatch[3];
            return entry;
        }

        // Try Syslog
        const syslogMatch = line.match(PATTERNS.SYSLOG);
        if (syslogMatch) {
             // Syslog usually lacks year, assume current
             const currentYear = new Date().getFullYear();
             entry.timestamp = new Date(`${syslogMatch[1]} ${currentYear}`);
             entry.message = syslogMatch[3];
             // Extract level from message if present, e.g. "sshd[123]: Failed..."
             if (entry.message.toLowerCase().includes('error') || entry.message.toLowerCase().includes('failed')) entry.level = 'error';
             else if (entry.message.toLowerCase().includes('warn')) entry.level = 'warn';
             else entry.level = 'info';

             entry.metadata = { host: syslogMatch[2] };
             return entry;
        }

        // Fallback: Check for keywords
        const lower = line.toLowerCase();
        if (lower.includes('error') || lower.includes('exception') || lower.includes('fatal')) entry.level = 'error';
        else if (lower.includes('warn')) entry.level = 'warn';
        else if (lower.includes('info')) entry.level = 'info';
        else if (lower.includes('debug')) entry.level = 'debug';

    } catch (e) {
        // Parsing failed, return raw
    }

    return entry;
}

function normalizeLevel(lvl: string | number): LogLevel {
    if (typeof lvl === 'number') {
        if (lvl >= 50) return 'error';
        if (lvl >= 40) return 'warn';
        if (lvl >= 30) return 'info';
        return 'debug';
    }
    const s = lvl.toLowerCase();
    if (s.includes('err') || s.includes('fatal') || s.includes('crit')) return 'error';
    if (s.includes('warn')) return 'warn';
    if (s.includes('info')) return 'info';
    if (s.includes('debug') || s.includes('trace')) return 'debug';
    return 'unknown';
}
