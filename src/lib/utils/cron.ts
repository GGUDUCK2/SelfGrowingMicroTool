import parser from 'cron-parser';
import cronstrue from 'cronstrue/i18n';

export interface CronParseResult {
  isValid: boolean;
  nextRuns: Date[];
  description: string;
  error?: string;
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
    // Validate and get next runs
    // In v5, it seems the static method is `parse` not `parseExpression`
    // Or the default export behaves differently in this version.
    // Let's check the import. Default export is CronExpressionParser class which has static `parse`.
    // However, older versions exported `parseExpression`.
    // Let's try `parser.parseExpression` first (backward compat) or `parser.parse`.
    // Checking the type definition: export default CronExpressionParser; static parse(...)

    // So it should be parser.parse(expression)

    const interval = parser.parse(expression);
    const nextRuns: Date[] = [];
    for (let i = 0; i < 5; i++) {
      nextRuns.push(interval.next().toDate());
    }

    // Get description
    // cronstrue supports 'en', 'ko' etc.
    let description = '';
    try {
        description = cronstrue.toString(expression, { locale: locale });
    } catch (e) {
        // Fallback or specific handling if cronstrue fails but parser succeeds (rare)
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
      error: (err as Error).message
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
