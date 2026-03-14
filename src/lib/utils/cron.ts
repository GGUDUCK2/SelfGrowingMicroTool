import cronstrue from 'cronstrue/i18n';

export interface CronParseResult {
  isValid: boolean;
  nextRuns: Date[];
  description: string;
  error?: string;
}

/**
 * Lightweight Cron Parser (Zero-Dependency)
 * Supports: * , - /
 * Fields: Minute, Hour, Day of Month, Month, Day of Week
 */
class SimpleCron {
  private minutes: Set<number>;
  private hours: Set<number>;
  private doms: Set<number>;
  private months: Set<number>;
  private dows: Set<number>;

  constructor(expression: string) {
    const parts = expression.trim().split(/\s+/);
    if (parts.length < 5) throw new Error("Invalid cron expression: too few parts");

    this.minutes = this.parsePart(parts[0], 0, 59);
    this.hours = this.parsePart(parts[1], 0, 23);
    this.doms = this.parsePart(parts[2], 1, 31);
    this.months = this.parsePart(parts[3], 1, 12);
    this.dows = this.parsePart(parts[4], 0, 6);
  }

  private parsePart(part: string, min: number, max: number): Set<number> {
    const values = new Set<number>();
    if (part === '*') {
      for (let i = min; i <= max; i++) values.add(i);
      return values;
    }

    const commaParts = part.split(',');
    for (const p of commaParts) {
      if (p.includes('/')) {
        const [range, stepStr] = p.split('/');
        const step = parseInt(stepStr, 10);
        if (isNaN(step) || step === 0) throw new Error(`Invalid step: ${stepStr}`);

        let start = min, end = max;
        if (range !== '*') {
          if (range.includes('-')) {
            const [s, e] = range.split('-').map(v => parseInt(v, 10));
            start = s; end = e;
          } else {
            start = parseInt(range, 10);
          }
        }

        for (let i = start; i <= end; i += step) {
          if (i >= min && i <= max) values.add(i);
        }
      } else if (p.includes('-')) {
        const [start, end] = p.split('-').map(v => parseInt(v, 10));
        for (let i = start; i <= end; i++) {
          if (i >= min && i <= max) values.add(i);
        }
      } else {
        const val = parseInt(p, 10);
        if (!isNaN(val) && val >= min && val <= max) values.add(val);
      }
    }
    return values;
  }

  public nextRuns(count: number, startDate: Date = new Date()): Date[] {
    const runs: Date[] = [];
    const current = new Date(startDate.getTime());
    current.setSeconds(0, 0);
    current.setMinutes(current.getMinutes() + 1); // Start from next minute

    // Safety limit: 1 year or 50000 iterations
    let iterations = 0;
    while (runs.length < count && iterations < 50000) {
      if (this.matches(current)) {
        runs.push(new Date(current));
      }
      current.setMinutes(current.getMinutes() + 1);
      iterations++;
    }
    return runs;
  }

  private matches(date: Date): boolean {
    if (!this.minutes.has(date.getMinutes())) return false;
    if (!this.hours.has(date.getHours())) return false;
    if (!this.doms.has(date.getDate())) return false;
    if (!this.months.has(date.getMonth() + 1)) return false;
    if (!this.dows.has(date.getDay())) return false;
    return true;
  }
}

export function parseCronExpression(expression: string, locale: string = 'en'): CronParseResult {
  if (!expression || expression.trim() === '') {
    return {
      isValid: false,
      nextRuns: [],
      description: '',
      error: 'Empty expression'
    };
  }

  try {
    const cron = new SimpleCron(expression);
    const nextRuns = cron.nextRuns(5);

    let description = '';
    try {
      description = cronstrue.toString(expression, { locale: locale });
    } catch (e) {
      description = locale === 'ko' ? '유효한 Cron 표현식' : 'Valid Cron expression';
    }

    return {
      isValid: true,
      nextRuns,
      description
    };
  } catch (err) {
    return {
      isValid: false,
      nextRuns: [],
      description: '',
      error: (err as Error).message || 'Invalid cron expression'
    };
  }
}

export const COMMON_PRESETS = [
  { name: 'Every Minute', value: '* * * * *' },
  { name: 'Every 5 Minutes', value: '*/5 * * * *' },
  { name: 'Every Hour', value: '0 * * * *' },
  { name: 'Every Day at Midnight', value: '0 0 * * *' },
  { name: 'Every Week (Sunday)', value: '0 0 * * 0' },
  { name: 'Every Month (1st)', value: '0 0 1 * *' },
];

export const COMMON_PRESETS_KO = [
  { name: '매 분', value: '* * * * *' },
  { name: '5분마다', value: '*/5 * * * *' },
  { name: '매 시간', value: '0 * * * *' },
  { name: '매일 자정', value: '0 0 * * *' },
  { name: '매주 일요일', value: '0 0 * * 0' },
  { name: '매월 1일', value: '0 0 1 * *' },
];
