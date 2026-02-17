import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  if (params.lang !== 'en' && params.lang !== 'ko') {
    throw redirect(308, '/en/tools/logic-forge');
  }
  return {};
};
