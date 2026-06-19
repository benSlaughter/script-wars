import type { PageServerLoad } from './$types';
import { getAllGames } from '$lib/server/games';

export const load: PageServerLoad = () => {
	const games = getAllGames().map((g) => ({
		id: g.id,
		name: g.name,
		icon: g.icon
	}));

	return { games };
};
