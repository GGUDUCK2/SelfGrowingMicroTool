import QRCode from 'qrcode';
import type { QRState, WiFiConfig, VCardConfig, EmailConfig, SMSConfig, CryptoConfig, QRDesign } from './types';

export const generateWiFiPayload = (config?: WiFiConfig): string => {
    if (!config || !config.ssid) return '';
    const escape = (s: string) => s.replace(/([\\;:,"'])/g, '\\$1');
    let s = `WIFI:S:${escape(config.ssid)};`;
    s += `T:${config.encryption};`;
    if (config.password) s += `P:${escape(config.password)};`;
    if (config.hidden) s += `H:true;`;
    s += `;`;
    return s;
};

export const generateVCardPayload = (config?: VCardConfig): string => {
    if (!config) return '';
    // Simple VCard 3.0
    const fields = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${config.lastName};${config.firstName};;;`,
        `FN:${config.firstName} ${config.lastName}`,
    ];
    if (config.org) fields.push(`ORG:${config.org}`);
    if (config.title) fields.push(`TITLE:${config.title}`);
    if (config.phone) fields.push(`TEL;TYPE=CELL:${config.phone}`);
    if (config.email) fields.push(`EMAIL:${config.email}`);
    if (config.url) fields.push(`URL:${config.url}`);

    // Address if street or city or country exists
    if (config.street || config.city || config.country) {
        // ADR format: ;;street;city;region;zip;country
        fields.push(`ADR:;;${config.street || ''};${config.city || ''};;;${config.country || ''}`);
    }

    fields.push('END:VCARD');
    return fields.join('\n');
};

export const generateEmailPayload = (config?: EmailConfig): string => {
    if (!config || !config.to) return '';
    return `mailto:${config.to}?subject=${encodeURIComponent(config.subject || '')}&body=${encodeURIComponent(config.body || '')}`;
};

export const generateSMSPayload = (config?: SMSConfig): string => {
    if (!config || !config.phone) return '';
    // SMSTO is widely supported by QR readers
    return `SMSTO:${config.phone}:${config.message || ''}`;
};

export const generateCryptoPayload = (config?: CryptoConfig): string => {
    if (!config || !config.address) return '';
    const prefix = config.currency.toLowerCase();
    let uri = `${prefix}:${config.address}`;

    const params: string[] = [];
    if (config.amount) params.push(`amount=${config.amount}`);
    if (config.label) params.push(`label=${encodeURIComponent(config.label)}`);
    if (config.message) params.push(`message=${encodeURIComponent(config.message)}`);

    if (params.length > 0) {
        uri += `?${params.join('&')}`;
    }
    return uri;
};

export const generatePayload = (state: QRState): string => {
    switch (state.type) {
        case 'url': return state.url || '';
        case 'text': return state.text || '';
        case 'wifi': return generateWiFiPayload(state.wifi);
        case 'vcard': return generateVCardPayload(state.vcard);
        case 'email': return generateEmailPayload(state.email);
        case 'sms': return generateSMSPayload(state.sms);
        case 'crypto': return generateCryptoPayload(state.crypto);
        case 'bulk': {
            const items = state.bulk?.items?.split('\n').filter(l => l.trim()) || [];
            const prefix = state.bulk?.prefix || '';
            if (items.length > 0) return prefix + items[0];
            return 'BULK MODE';
        }
        default: return '';
    }
};

export const generateQRCodeDataURL = async (text: string, design: QRDesign): Promise<string> => {
    if (!text) return '';
    try {
        return await QRCode.toDataURL(text, {
            errorCorrectionLevel: design.errorCorrectionLevel,
            margin: design.margin,
            width: design.width || 300,
            color: {
                dark: design.colorDark,
                light: design.colorLight
            }
        });
    } catch (e) {
        console.error('QR Generation failed', e);
        return '';
    }
};
