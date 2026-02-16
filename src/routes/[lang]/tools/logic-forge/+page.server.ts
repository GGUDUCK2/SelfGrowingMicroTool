import { redirect } from '@sveltejs/kit';

export const load = async ({ params }) => {
  if (params.lang !== 'en' && params.lang !== 'ko') {
    throw redirect(308, '/en/tools/logic-forge');
  }
  return {};
};
