import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { scripts } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import { getAllGames } from '$lib/server/games';

export const load: PageServerLoad = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });

	const games = getAllGames().map((g) => ({
		id: g.id,
		name: g.name,
		icon: g.icon,
		description: g.description
	}));

	if (!session?.user) {
		return {
			games,
			gameScripts: {} as Record<string, Array<{ id: string; name: string; isActiveEntry: boolean; updatedAt: Date | null }>>,
			loggedIn: false
		};
	}

	const userScripts = await db
		.select({
			id: scripts.id,
			name: scripts.name,
			gameId: scripts.gameId,
			isActiveEntry: scripts.isActiveEntry,
			updatedAt: scripts.updatedAt
		})
		.from(scripts)
		.where(eq(scripts.userId, session.user.id))
		.orderBy(scripts.updatedAt);

	const gameScripts: Record<string, typeof userScripts> = {};
	for (const game of games) {
		gameScripts[game.id] = userScripts.filter((s) => s.gameId === game.id);
	}

	return { games, gameScripts, loggedIn: true };
};
