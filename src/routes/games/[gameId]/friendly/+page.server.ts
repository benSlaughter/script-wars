import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { scripts, users } from '$lib/server/schema';
import { eq, and, ne } from 'drizzle-orm';
import { getGame } from '$lib/server/games';
import { error } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, request }) => {
	const { gameId } = params;
	const game = getGame(gameId);
	if (!game) throw error(404, 'Game not found');

	const session = await auth.api.getSession({ headers: request.headers });

	let hasActiveScript = false;
	let opponents: { scriptId: string; scriptName: string; playerName: string; playerId: string }[] =
		[];

	if (session) {
		// Check if the user has an active script
		const [myScript] = await db
			.select()
			.from(scripts)
			.where(
				and(
					eq(scripts.userId, session.user.id),
					eq(scripts.gameId, gameId),
					eq(scripts.isActiveEntry, true)
				)
			);

		hasActiveScript = !!myScript;

		// Get all other players' active scripts
		opponents = await db
			.select({
				scriptId: scripts.id,
				scriptName: scripts.name,
				playerName: users.name,
				playerId: users.id
			})
			.from(scripts)
			.innerJoin(users, eq(scripts.userId, users.id))
			.where(
				and(
					eq(scripts.gameId, gameId),
					eq(scripts.isActiveEntry, true),
					ne(scripts.userId, session.user.id)
				)
			);
	}

	return {
		gameId,
		gameName: game.name,
		hasActiveScript,
		opponents,
		isLoggedIn: !!session
	};
};
