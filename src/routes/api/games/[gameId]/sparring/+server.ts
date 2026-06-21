import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { scripts } from '$lib/server/schema';
import { eq, and } from 'drizzle-orm';
import { runMatch } from '$lib/server/engine/match-runner';
import { getGame } from '$lib/server/games';
import { auth } from '$lib/server/auth';
import { checkRateLimit, RATE_LIMITS } from '$lib/server/rate-limit';

export const POST: RequestHandler = async ({ request, params }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) throw error(401, 'Not authenticated');

	const { gameId } = params;
	const game = getGame(gameId);
	if (!game) throw error(404, 'Game not found');

	const { allowed } = checkRateLimit(`friendly:${session.user.id}`, RATE_LIMITS.friendlyMatch);
	if (!allowed) throw error(429, 'Too many matches. Try again in a minute.');

	const body = await request.json();
	const { scriptAId, scriptBId } = body;
	if (!scriptAId || !scriptBId) throw error(400, 'Missing scriptAId or scriptBId');
	if (scriptAId === scriptBId) throw error(400, 'Pick two different scripts');

	// Verify both scripts belong to this user and this game
	const [scriptA] = await db
		.select()
		.from(scripts)
		.where(
			and(
				eq(scripts.id, scriptAId),
				eq(scripts.userId, session.user.id),
				eq(scripts.gameId, gameId)
			)
		);

	const [scriptB] = await db
		.select()
		.from(scripts)
		.where(
			and(
				eq(scripts.id, scriptBId),
				eq(scripts.userId, session.user.id),
				eq(scripts.gameId, gameId)
			)
		);

	if (!scriptA || !scriptB) throw error(404, 'Script not found (must be yours and for this game)');

	// Run the match
	const result = await runMatch(scriptA.code, scriptB.code, game.maxRounds, {
		isValidMove: (m) => game.isValidMove(m),
		resolveRound: (a, b) => game.resolveRound(a, b),
		getPoints: (a, b) => game.getPoints(a, b),
		buildContext: (r, my, opp) => game.buildContext(r, my, opp),
		pointBased: game.pointBased
	});

	return json({
		scriptA: scriptA.name,
		scriptB: scriptB.name,
		winsA: result.winsA,
		winsB: result.winsB,
		draws: result.draws,
		scoreA: result.scoreA,
		scoreB: result.scoreB,
		winner: result.winner,
		rounds: result.rounds
	});
};
