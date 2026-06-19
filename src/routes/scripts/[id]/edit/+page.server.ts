import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	throw redirect(302, `/games/rps/scripts/${params.id}/edit`);
};
