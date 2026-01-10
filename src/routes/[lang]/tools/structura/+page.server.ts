import { dictionaries } from '$lib/dictionaries';

export function load({ params }: { params: { lang: string } }) {
  const lang = params.lang as keyof typeof dictionaries;
  // Fallback to English if lang is not supported, though route matcher should handle it
  const dict = dictionaries[lang] || dictionaries.en;

  return {
    lang,
    dict
  };
}
