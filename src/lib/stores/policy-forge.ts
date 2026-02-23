import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { PolicyData } from '$lib/types/policy-forge';

function getDefaultPolicy(): PolicyData {
    return {
        companyName: '',
        websiteUrl: 'https://',
        email: '',
        address: '',
        country: 'United States',
        foundedYear: new Date().getFullYear().toString(),

        collectEmail: true,
        collectName: true,
        collectPhone: false,
        collectAddress: false,
        collectPayment: false,
        collectDevice: true,
        collectSocial: false,
        collectCookies: true,

        canRegister: true,
        minAge: 13,
        hasNewsletter: false,
        hasAds: false,
        analytics: 'google',

        governingLaw: 'California, USA',
        termination: true,
        refundPeriod: 30,

        lastUpdated: new Date().toISOString().split('T')[0],
        activeType: 'privacy'
    };
}

function createPolicyStore() {
    const { subscribe, set, update } = writable<PolicyData>(getDefaultPolicy());

    return {
        subscribe,
        set,
        update,
        reset: () => set(getDefaultPolicy()),
        load: (data: Partial<PolicyData>) => update(s => ({ ...s, ...data }))
    };
}

export const policyStore = createPolicyStore();
