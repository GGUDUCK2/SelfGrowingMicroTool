import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

const SUPPORTED_LANGS = ['en', 'ko'];

export const handle: Handle = async ({ event, resolve }) => {
    const { pathname } = event.url;

    // Handle root redirect
    if (pathname === '/') {
        // Simple default to Korean as requested in original code,
        // but ideally we could detect Accept-Language here too.
        // For now, sticking to the existing behavior for root.
        throw redirect(307, '/ko');
    }

    // Check if path starts with a supported language
    const firstSegment = pathname.split('/')[1];

    if (!SUPPORTED_LANGS.includes(firstSegment)) {
        // It's a path without language, e.g. /tools/xyz or /pwa
        // We should redirect to /{default_lang}/{path}
        // But we need to be careful about assets (/_app, /favicon.ico, etc)
        // SvelteKit usually handles _app automatically, but explicit check is safer.
        if (
            !pathname.startsWith('/_app') &&
            !pathname.startsWith('/manifest.json') &&
            !pathname.startsWith('/service-worker.js') &&
            !pathname.startsWith('/favicon.ico') &&
            !pathname.startsWith('/robots.txt') &&
            !pathname.startsWith('/sitemap.xml') &&
             // Check if it looks like a file extension (e.g. .png, .css)
            !pathname.match(/\.[^/]+$/)
        ) {
             // Detect language from header
             const acceptLanguage = event.request.headers.get('accept-language');
             let lang = 'en'; // Default to English for international users

             if (acceptLanguage) {
                 // Simple check: if 'ko' appears before 'en' or is the primary
                 if (acceptLanguage.includes('ko')) {
                     lang = 'ko';
                 }
             }

             // Redirect to the same path but with language prefix
             throw redirect(307, `/${lang}${pathname}`);
        }
    }

    return resolve(event);
};
