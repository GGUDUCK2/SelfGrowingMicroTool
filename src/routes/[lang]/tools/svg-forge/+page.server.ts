import { redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
  const { lang } = params;

  if (lang !== 'en' && lang !== 'ko') {
    throw redirect(308, '/en/tools/svg-forge');
  }

  return {};
};
