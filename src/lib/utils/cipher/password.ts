// src/lib/utils/cipher/password.ts

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  ambiguous: boolean; // avoid l, 1, I, 0, O
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
const AMBIGUOUS = 'l1I0O';

export function generatePassword(options: PasswordOptions): string {
  let chars = '';
  if (options.uppercase) chars += UPPERCASE;
  if (options.lowercase) chars += LOWERCASE;
  if (options.numbers) chars += NUMBERS;
  if (options.symbols) chars += SYMBOLS;

  if (options.ambiguous) {
    // Remove ambiguous characters
    const ambigSet = new Set(AMBIGUOUS.split(''));
    chars = chars.split('').filter(c => !ambigSet.has(c)).join('');
  }

  if (!chars) return '';

  let password = '';
  const array = new Uint32Array(options.length);
  crypto.getRandomValues(array);

  for (let i = 0; i < options.length; i++) {
    password += chars[array[i] % chars.length];
  }

  return password;
}

export function calculateEntropy(password: string): number {
  if (!password) return 0;

  let poolSize = 0;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) poolSize += 32; // Rough estimate for symbols

  if (poolSize === 0) return 0;

  return Math.floor(password.length * Math.log2(poolSize));
}

export function estimateCrackTime(entropy: number): string {
  // Assume a very fast cracker can try 100 billion passwords per second (10^11)
  // This is a conservative estimate for offline attacks on fast GPUs.
  const guessesPerSecond = 1e11;
  const seconds = Math.pow(2, entropy) / guessesPerSecond;

  if (seconds < 1) return 'Instant';
  if (seconds < 60) return `${Math.floor(seconds)} seconds`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.floor(seconds / 86400)} days`;
  if (seconds < 3153600000) return `${Math.floor(seconds / 31536000)} years`;
  return 'Centuries';
}
