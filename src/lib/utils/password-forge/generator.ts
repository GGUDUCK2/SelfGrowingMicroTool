import { wordlist } from './words';

export interface PasswordConfig {
    length: number;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
    excludeSimilar: boolean;
    excludeAmbiguous: boolean;
}

export interface PassphraseConfig {
    words: number;
    separator: string;
    capitalize: 'none' | 'first' | 'all';
    includeNumber: boolean;
    template?: string; // e.g. "word-number-word-symbol"
}

export interface PronounceableConfig {
    length: number;
    includeNumber: boolean;
    includeSymbol: boolean;
}

export interface PasswordAnalysis {
    score: number; // 1-5
    entropy: number;
    feedback: string[];
    isVulnerable: boolean; // simple check like dictionary word or consecutive chars
}

const CHAR_SETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
};

const SIMILAR_CHARS = /[il1Lo0O]/g;
const AMBIGUOUS_CHARS = /[{}[\]()\/\'"`~,;:.<>]/g;

export function generatePassword(config: PasswordConfig): { password: string, entropy: number } {
    let chars = '';
    if (config.uppercase) chars += CHAR_SETS.uppercase;
    if (config.lowercase) chars += CHAR_SETS.lowercase;
    if (config.numbers) chars += CHAR_SETS.numbers;
    if (config.symbols) chars += CHAR_SETS.symbols;

    if (config.excludeSimilar) {
        chars = chars.replace(SIMILAR_CHARS, '');
    }
    if (config.excludeAmbiguous) {
        chars = chars.replace(AMBIGUOUS_CHARS, '');
    }

    if (chars.length === 0) {
        return { password: '', entropy: 0 };
    }

    let password = '';
    const array = new Uint32Array(config.length);
    crypto.getRandomValues(array);

    for (let i = 0; i < config.length; i++) {
        password += chars[array[i] % chars.length];
    }

    // Ensure at least one character from each selected set is included
    // This is a naive approach but works well enough for general use
    const positions = Array.from({ length: config.length }, (_, i) => i);
    // shuffle positions
    for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    let posIdx = 0;
    const ensureChar = (set: string) => {
        if (!set) return;
        let c = set;
        if (config.excludeSimilar) c = c.replace(SIMILAR_CHARS, '');
        if (config.excludeAmbiguous) c = c.replace(AMBIGUOUS_CHARS, '');
        if (c.length === 0) return;

        const randomCharArray = new Uint32Array(1);
        crypto.getRandomValues(randomCharArray);
        const randomChar = c[randomCharArray[0] % c.length];

        if (posIdx < positions.length) {
             const idx = positions[posIdx++];
             password = password.substring(0, idx) + randomChar + password.substring(idx + 1);
        }
    };

    if (config.uppercase) ensureChar(CHAR_SETS.uppercase);
    if (config.lowercase) ensureChar(CHAR_SETS.lowercase);
    if (config.numbers) ensureChar(CHAR_SETS.numbers);
    if (config.symbols) ensureChar(CHAR_SETS.symbols);

    const entropy = calculateEntropy(chars.length, config.length);
    return { password, entropy };
}

export function generatePassphrase(config: PassphraseConfig): { password: string, entropy: number } {
    let password = '';
    const selectedWords: string[] = [];
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    // Fallback if template is provided but empty
    if (config.template) {
        const parts = config.template.split('-');
        let templateEntropy = 0;

        parts.forEach((part, index) => {
            if (part === 'word') {
                const randomArray = new Uint32Array(1);
                crypto.getRandomValues(randomArray);
                let word = wordlist[randomArray[0] % wordlist.length];
                if (config.capitalize === 'all') word = word.toUpperCase();
                else if (config.capitalize === 'first') word = word.charAt(0).toUpperCase() + word.slice(1);
                selectedWords.push(word);
                templateEntropy += Math.log2(wordlist.length);
            } else if (part === 'number') {
                const randomArray = new Uint32Array(1);
                crypto.getRandomValues(randomArray);
                const num = randomArray[0] % 100; // 0-99
                selectedWords.push(num.toString());
                templateEntropy += Math.log2(100);
            } else if (part === 'symbol') {
                const randomArray = new Uint32Array(1);
                crypto.getRandomValues(randomArray);
                const sym = symbols[randomArray[0] % symbols.length];
                selectedWords.push(sym);
                templateEntropy += Math.log2(symbols.length);
            }
        });

        password = selectedWords.join(config.separator);
        return { password, entropy: templateEntropy };
    }

    for(let i=0; i<config.words; i++) {
        const randomArray = new Uint32Array(1);
        crypto.getRandomValues(randomArray);
        let word = wordlist[randomArray[0] % wordlist.length];

        if (config.capitalize === 'all') {
            word = word.toUpperCase();
        } else if (config.capitalize === 'first') {
            word = word.charAt(0).toUpperCase() + word.slice(1);
        }

        selectedWords.push(word);
    }

    if (config.includeNumber) {
        const randomPosArray = new Uint32Array(1);
        crypto.getRandomValues(randomPosArray);
        const pos = randomPosArray[0] % selectedWords.length;

        const randomNumberArray = new Uint32Array(1);
        crypto.getRandomValues(randomNumberArray);
        const num = (randomNumberArray[0] % 9) + 1; // 1-9

        selectedWords[pos] += num.toString();
    }

    password = selectedWords.join(config.separator);

    // Entropy = log2(wordlist_size ^ num_words) + optional number entropy
    const poolSize = wordlist.length;
    let entropy = config.words * Math.log2(poolSize);
    if (config.includeNumber) entropy += Math.log2(9);

    return { password, entropy };
}

export function generatePronounceable(config: PronounceableConfig): { password: string, entropy: number } {
    const consonants = 'bcdfghjklmnpqrstvwxyz';
    const vowels = 'aeiou';
    const symbols = '!@#$%&*';
    const numbers = '0123456789';
    let password = '';
    let isConsonant = true; // start with consonant usually looks better

    // reserve space for number/symbol
    const coreLength = config.length - (config.includeNumber ? 1 : 0) - (config.includeSymbol ? 1 : 0);

    for (let i = 0; i < coreLength; i++) {
        const pool = isConsonant ? consonants : vowels;
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        let char = pool[array[0] % pool.length];

        // Randomly uppercase
        if (crypto.getRandomValues(new Uint32Array(1))[0] % 10 === 0) {
            char = char.toUpperCase();
        }

        password += char;
        isConsonant = !isConsonant; // alternate
    }

    if (config.includeNumber) {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        const char = numbers[array[0] % numbers.length];
        password += char;
    }
    if (config.includeSymbol) {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        const char = symbols[array[0] % symbols.length];
        password += char;
    }

    // Entropy approximation: (consonants * vowels) pattern + symbols/numbers
    let poolSize = (consonants.length + vowels.length) / 2; // average
    if (config.includeNumber) poolSize += numbers.length;
    if (config.includeSymbol) poolSize += symbols.length;

    const entropy = calculateEntropy(poolSize, config.length);
    return { password, entropy };
}

export function analyzePassword(password: string): PasswordAnalysis {
    let entropy = 0;
    let poolSize = 0;
    const feedback: string[] = [];
    let isVulnerable = false;

    if (!password) {
        return { score: 0, entropy: 0, feedback: ["Password is empty."], isVulnerable: true };
    }

    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

    entropy = calculateEntropy(poolSize, password.length);

    if (password.length < 8) {
        feedback.push("Password is too short. Aim for at least 12 characters.");
        isVulnerable = true;
    }
    if (!/[A-Z]/.test(password)) feedback.push("Add uppercase letters to increase strength.");
    if (!/[0-9]/.test(password)) feedback.push("Add numbers to increase strength.");
    if (!/[^a-zA-Z0-9]/.test(password)) feedback.push("Add symbols (e.g. !@#$) to increase strength.");

    // Simple consecutive check (123, abc)
    if (/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
        feedback.push("Contains common consecutive characters (e.g. '123' or 'abc').");
        isVulnerable = true;
    }

    // Repeated chars check (aaa, 111)
    if (/(.)\1{2,}/.test(password)) {
        feedback.push("Contains repeated characters (e.g. 'aaa').");
        isVulnerable = true;
    }

    let score = getStrength(entropy).score;
    if (isVulnerable) score = Math.max(1, score - 1); // penalize

    return { score, entropy, feedback, isVulnerable };
}

function calculateEntropy(poolSize: number, length: number): number {
    if (poolSize === 0 || length === 0) return 0;
    return length * Math.log2(poolSize);
}

export function getStrength(entropy: number): { label: string, color: string, score: number } {
    if (entropy < 28) return { label: 'Very Weak', color: 'bg-red-500', score: 1 };
    if (entropy < 36) return { label: 'Weak', color: 'bg-orange-500', score: 2 };
    if (entropy < 60) return { label: 'Reasonable', color: 'bg-yellow-500', score: 3 };
    if (entropy < 128) return { label: 'Strong', color: 'bg-green-500', score: 4 };
    return { label: 'Very Strong', color: 'bg-blue-500', score: 5 };
}

export function getCrackTimeEstimation(entropy: number): string {
    // Assuming 100 billion guesses per second (high-end offline cracking)
    const guessesPerSecond = 1e11;
    const totalGuesses = Math.pow(2, entropy);
    const seconds = totalGuesses / guessesPerSecond;

    if (seconds < 1) return "Instantly";
    if (seconds < 60) return "Less than a minute";
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} years`;
    return "Centuries";
}
