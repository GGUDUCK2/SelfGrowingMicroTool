export interface SmartSuggestion {
  id: string;
  label: string;
  action: string; // matches action types in Toolbar
  mode: string;   // matches mode types
  confidence: number;
}

export class SmartMagic {
  static detect(text: string): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];
    const trimmed = text.trim();

    if (!trimmed) return [];

    // JSON Detection
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        JSON.parse(trimmed);
        // If it parses, it's JSON. Suggest formatting if it looks minified or messy.
        if (!trimmed.includes('\n') || trimmed.split('\n').length < 3) {
             suggestions.push({
                id: 'format-json',
                label: 'formatJson',
                action: 'clean',
                mode: 'formatJson',
                confidence: 0.95
             });
        }
      } catch (e) {
         // Invalid JSON
      }
    }

    // Base64 Detection (naive)
    // Needs to be at least some length and match chars.
    if (trimmed.length > 8 && /^[A-Za-z0-9+/]+={0,2}$/.test(trimmed)) {
       try {
           const decoded = atob(trimmed);
           if (decoded.length > 0) {
                suggestions.push({
                    id: 'decode-base64',
                    label: 'decodeBase64',
                    action: 'encode',
                    mode: 'base64Decode',
                    confidence: 0.8
                });
           }
       } catch (e) {}
    }

    // URL Encoded
    if (trimmed.includes('%20') || trimmed.includes('%2F') || trimmed.includes('%3A') || trimmed.includes('%3F')) {
        suggestions.push({
            id: 'decode-url',
            label: 'decodeUrl',
            action: 'encode',
            mode: 'urlDecode',
            confidence: 0.9
        });
    }

    // JWT Detection - suggest decoding
    if (trimmed.split('.').length === 3 && trimmed.startsWith('ey')) {
         // JWT usually can be base64 decoded parts.
         // But String Theory might not be the best place for full JWT debug.
         // Just base64 decode is fine.
         suggestions.push({
            id: 'decode-jwt-header',
            label: 'decodeBase64', // Reuse existing label or add new one
            action: 'encode',
            mode: 'base64Decode',
            confidence: 0.85
        });
    }

    // Messy Whitespace
    if (/\n\s*\n\s*\n/.test(text) || /[ \t]{2,}/.test(text)) {
        suggestions.push({
            id: 'clean-whitespace',
            label: 'cleanWhitespace',
            action: 'clean',
            mode: 'normalizeSpace',
            confidence: 0.7
        });
    }

    // HTML Entity Detection
    if (/&[a-z]+;|&#[0-9]+;/i.test(text)) {
        suggestions.push({
            id: 'decode-html',
            label: 'decodeHtml', // Need to add this label
            action: 'encode',
            mode: 'htmlEntityDecode',
            confidence: 0.9
        });
    }

    return suggestions;
  }
}
