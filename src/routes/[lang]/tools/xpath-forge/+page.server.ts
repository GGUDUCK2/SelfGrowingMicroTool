import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    // Dictionary resolution is now handled entirely on the client or by layout,
    // so we don't need to try and fetch it from the parent here.
    return {};
};
