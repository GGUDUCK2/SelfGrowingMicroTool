import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  if (params.lang !== 'en' && params.lang !== 'ko') {
    throw error(404, 'Language not supported');
  }
  return {};
};
