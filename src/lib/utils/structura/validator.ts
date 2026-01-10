import { convertData } from './converter';

export const validateData = (input: string, format: 'json' | 'yaml' | 'xml' | 'csv'): { isValid: boolean; error?: string } => {
  // We reuse the parsing logic in converter to validate
  const result = convertData(input, format, format); // Converting to itself effectively validates parsing
  if (result.error) {
    return { isValid: false, error: result.error };
  }
  return { isValid: true };
};
