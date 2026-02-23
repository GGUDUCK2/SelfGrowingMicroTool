export type PolicyType = 'privacy' | 'terms' | 'cookie' | 'refund';
export type TrackingType = 'google' | 'plausible' | 'custom' | 'none';

export interface PolicyData {
    // Identity
    companyName: string;
    websiteUrl: string;
    email: string;
    address: string;
    country: string;
    foundedYear: string;

    // User Data Collection
    collectEmail: boolean;
    collectName: boolean;
    collectPhone: boolean;
    collectAddress: boolean;
    collectPayment: boolean;
    collectDevice: boolean;
    collectSocial: boolean; // Social Login
    collectCookies: boolean;

    // Features
    canRegister: boolean; // User Accounts
    minAge: number;
    hasNewsletter: boolean;
    hasAds: boolean; // AdSense etc.
    analytics: TrackingType;

    // Legal
    governingLaw: string; // Jurisdiction
    termination: boolean; // Right to terminate
    refundPeriod: number; // Days (0 for no refund)

    // Meta
    lastUpdated: string; // YYYY-MM-DD
    activeType: PolicyType;
}

export interface PolicySection {
    id: string;
    title: string;
    content: string; // Markdown
}
