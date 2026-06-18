import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// TODO: Query actual leaderboard from DB once matches exist
	return {
		entries: [] as {
			name: string;
			wins: number;
			losses: number;
			draws: number;
			winRate: string;
		}[]
	};
};
