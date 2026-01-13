import type { ExtractionType, ExtractionResult } from './types';

export class TextExtractor {
  static extract(text: string, type: ExtractionType): string[] {
    const patterns: Record<ExtractionType, RegExp> = {
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      url: /(https?:\/\/[^\s]+)/g,
      phone: /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
      hashtag: /#[a-zA-Z0-9_]+/g,
      mention: /@[a-zA-Z0-9_]+/g,
      ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
      ipv6: /([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}/g, // Simplified IPv6
      hexColor: /#(?:[0-9a-fA-F]{3}){1,2}\b/g,
      date: /\b\d{4}-\d{2}-\d{2}\b/g, // YYYY-MM-DD
      time: /\b\d{2}:\d{2}(:\d{2})?\b/g, // HH:MM or HH:MM:SS
      creditCard: /\b(?:\d{4}[ -]?){3}\d{4}\b/g, // Basic regex, not checking Luhn
      jwt: /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
      uuid: /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g
    };

    const matches = text.match(patterns[type]) || [];
    return [...new Set(matches)]; // Return unique matches
  }

  static analyzeAll(text: string): ExtractionResult[] {
    const types: ExtractionType[] = [
        'email', 'url', 'phone', 'hashtag', 'mention',
        'ipv4', 'hexColor', 'date', 'time', 'creditCard', 'jwt', 'uuid'
    ];
    const results: ExtractionResult[] = [];

    for (const type of types) {
      const matches = this.extract(text, type);
      if (matches.length > 0) {
        results.push({
            type,
            value: matches.join('\n'),
            count: matches.length
        });
      }
    }

    return results;
  }
}
