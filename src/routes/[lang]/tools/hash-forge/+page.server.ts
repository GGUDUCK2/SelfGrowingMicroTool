import { redirect } from '@sveltejs/kit';

export const load = ({ params }) => {
  const { lang } = params;

  if (lang !== 'en' && lang !== 'ko') {
    throw redirect(308, '/en/tools/hash-forge');
  }

  return {};
};
