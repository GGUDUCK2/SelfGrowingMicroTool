/**
 * Estimates the number of tokens in a text string.
 * Uses a heuristic based on GPT-4 (cl100k_base) behavior.
 * - ASCII characters are roughly 0.25 tokens.
 * - CJK and other multi-byte characters are roughly 1.5 - 2 tokens.
 */
export function estimateTokens(text: string): number {
    if (!text) return 0;

    let tokenCount = 0;
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);

        // Basic ASCII (A-Z, a-z, 0-9, common punctuation)
        if (code <= 127) {
            tokenCount += 0.25;
        }
        // Extended Latin, Greek, Cyrillic, etc.
        else if (code <= 2047) {
            tokenCount += 1;
        }
        // CJK, Emoji, etc.
        else {
            tokenCount += 1.5;
        }
    }

    // Always round up to be safe
    return Math.ceil(tokenCount);
}

/**
 * Estimates cost for GPT-4 input (approximate).
 * Pricing: $0.03 / 1k tokens (Input) - Note: Prices change, this is a rough snapshot.
 * Using a generic "High End" model pricing.
 */
export function estimateCost(tokens: number, model: 'gpt-4' | 'gpt-3.5-turbo' = 'gpt-4'): number {
    const pricing = {
        'gpt-4': 0.03 / 1000,
        'gpt-3.5-turbo': 0.0005 / 1000
    };

    return tokens * pricing[model];
}
