export interface PasswordForgeHistory {
    id?: number;
    password: string;
    mode: 'password' | 'passphrase' | 'pronounceable';
    length: number;
    entropy: number;
    strength: string;
    createdAt: Date;
    starred?: number;
}
