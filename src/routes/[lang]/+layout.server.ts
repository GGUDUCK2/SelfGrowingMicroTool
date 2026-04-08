import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, url }) => {
  const lang = params.lang;
  if (lang !== 'en' && lang !== 'ko') {
    // If the lang is invalid, replace it with 'en'
    const newPathname = url.pathname.replace(`/${lang}`, '/en');
    throw redirect(308, newPathname);
  }
  return {};
};