import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
  return {
    lang: params.lang,
    tool: 'zen-forge'
  };
};
