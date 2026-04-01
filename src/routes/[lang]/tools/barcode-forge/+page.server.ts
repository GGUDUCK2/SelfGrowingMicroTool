import { redirect } from '@sveltejs/kit';
import { dictionaries } from '$lib/dictionaries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const lang = params.lang;
	if (!dictionaries[lang as keyof typeof dictionaries]) {
		throw redirect(308, `/en/tools/barcode-forge`);
	}
	return {};
};
