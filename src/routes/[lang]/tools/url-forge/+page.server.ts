export const prerender = false;

export async function load({ params }: { params: { lang: string } }) {
  return {
    lang: params.lang
  };
}
