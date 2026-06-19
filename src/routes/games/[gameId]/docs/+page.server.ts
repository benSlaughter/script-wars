import type { PageServerLoad } from './$types';
import { getGame } from '$lib/server/games';

export const load: PageServerLoad = ({ params }) => ({
	docsSections: getGame(params.gameId).getDocsSections()
});
