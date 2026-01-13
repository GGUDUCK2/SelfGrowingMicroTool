export type QRType = 'text' | 'url' | 'wifi' | 'email' | 'sms' | 'vcard' | 'crypto';

export type WiFiEncryption = 'WPA' | 'WEP' | 'nopass';

export interface WiFiConfig {
    ssid: string;
    password?: string;
    encryption: WiFiEncryption;
    hidden: boolean;
}

export interface VCardConfig {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    org?: string;
    title?: string;
    url?: string;
    street?: string;
    city?: string;
    country?: string;
}

export interface EmailConfig {
    to: string;
    subject: string;
    body: string;
}

export interface SMSConfig {
    phone: string;
    message: string;
}

export interface CryptoConfig {
    currency: 'BTC' | 'ETH' | 'SOL';
    address: string;
    amount?: string;
    label?: string; // e.g. recipient name
    message?: string;
}

export interface QRDesign {
    colorDark: string;
    colorLight: string;
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
    margin: number;
    scale: number; // Pixels per module (approx)
    width?: number; // Target width
}

export interface QRState {
    id?: number;
    type: QRType;

    // Raw string input for simple types
    text?: string;
    url?: string;

    // Complex configs
    wifi?: WiFiConfig;
    vcard?: VCardConfig;
    email?: EmailConfig;
    sms?: SMSConfig;
    crypto?: CryptoConfig;

    design: QRDesign;

    createdAt: number;
    starred?: boolean;
}
