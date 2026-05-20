import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
  const { lang } = params;
  if (lang !== 'ko' && lang !== 'en') {
    throw redirect(308, '/en/tools/clamp-forge');
  }
  return {};
};
