import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params }) => {
    if (params.lang !== 'en' && params.lang !== 'ko') {
        throw error(404, 'Page not found');
    }
    return {
        lang: params.lang
    };
};
