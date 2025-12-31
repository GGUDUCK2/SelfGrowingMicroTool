import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const lang = event.params.lang;

    if (event.url.pathname === '/') {
        throw redirect(307, '/ko');
    }

    return resolve(event);
};
