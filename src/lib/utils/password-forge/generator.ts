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
    let positions = Array.from({ length: config.length }, (_, i) => i);
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
    let selectedWords = [];

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
    let poolSize = wordlist.length;
    let entropy = config.words * Math.log2(poolSize);
    if (config.includeNumber) entropy += Math.log2(9);

    return { password, entropy };
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
