export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'unknown';

export interface LogEntry {
  id: string;
  timestamp: Date | null;
  level: LogLevel;
  message: string;
  metadata: Record<string, any>;
  raw: string;
}

export interface LogStats {
  total: number;
  errorCount: number;
  warnCount: number;
  infoCount: number;
  startTime: Date | null;
  endTime: Date | null;
}

export interface LogSession {
  id?: number;
  name: string;
  data: string;
  createdAt: Date;
}
