import type { TextStats, CharFrequency } from './types';

export class TextAnalyzer {
  static analyze(text: string): TextStats {
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const lines = text.length === 0 ? 0 : text.split(/\r\n|\r|\n/).length;
    const paragraphs = text.replace(/\n$/gm, '').split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

    // Bytes calculation (UTF-8)
    const bytes = new Blob([text]).size;

    // Reading time: Average 200 words per minute
    // Speaking time: Average 130 words per minute
    const readingTime = Math.ceil((words / 200) * 60);
    const speakingTime = Math.ceil((words / 130) * 60);

    // Sentence count (approximation)
    const sentences = text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

    return {
      chars,
      charsNoSpace,
      words,
      lines,
      paragraphs,
      bytes,
      readingTime,
      speakingTime,
      sentences
    };
  }

  static getFrequency(text: string): CharFrequency[] {
    const map = new Map<string, number>();
    for (const char of text) {
      if (!char.match(/\s/)) { // Ignore whitespace in freq analysis
        map.set(char, (map.get(char) || 0) + 1);
      }
    }

    const total = Array.from(map.values()).reduce((a, b) => a + b, 0);
    const sorted = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([char, count]) => ({
        char,
        count,
        percentage: total === 0 ? 0 : (count / total) * 100
      }));

    return sorted.slice(0, 50); // Return top 50
  }
}
