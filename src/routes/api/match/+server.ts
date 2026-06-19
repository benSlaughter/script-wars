import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { runMatch } from '$lib/server/engine';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { scripts, matches } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { checkRateLimit, RATE_LIMITS } from '$lib/server/rate-limit';
import { getGame } from '$lib/server/games';

export const POST: RequestHandler = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) throw error(401, 'Not authenticated');

	const { allowed } = checkRateLimit(`match:${session.user.id}`, RATE_LIMITS.scriptTest);
	if (!allowed) throw error(429, 'Too many match requests — try again in a minute');

	const body = await request.json();
	const { scriptAId, scriptBId, rounds = 100 } = body;

	if (!scriptAId || !scriptBId) {
		throw error(400, 'Two script IDs are required');
	}

	if (typeof rounds !== 'number' || rounds < 1 || rounds > 1000) {
		throw error(400, 'Rounds must be a number between 1 and 1000');
	}

	// Fetch both scripts — user must own at least one
	const [scriptA] = await db.select().from(scripts).where(eq(scripts.id, scriptAId));
	const [scriptB] = await db.select().from(scripts).where(eq(scripts.id, scriptBId));

	if (!scriptA || !scriptB) {
		throw error(404, 'One or both scripts not found');
	}

	// Both scripts must be for the same game
	if (scriptA.gameId !== scriptB.gameId) {
		throw error(400, 'Both scripts must be for the same game');
	}

	// Authorization: user must own at least one of the scripts
	if (scriptA.userId !== session.user.id && scriptB.userId !== session.user.id) {
		throw error(403, 'You must own at least one of the scripts');
	}

	// Get game functions for the correct game
	const game = getGame(scriptA.gameId);

	// Run the match with proper game logic
	const result = await runMatch(scriptA.code, scriptB.code, rounds, {
		isValidMove: (m) => game.isValidMove(m),
		resolveRound: (a, b) => game.resolveRound(a, b),
		getPoints: (a, b) => game.getPoints(a, b),
		buildContext: (r, my, opp) => game.buildContext(r, my, opp),
		pointBased: game.pointBased
	});

	// Store the result
	const matchId = nanoid();
	const winnerId =
		result.winner === 'a' ? scriptAId : result.winner === 'b' ? scriptBId : null;

	await db.insert(matches).values({
		id: matchId,
		gameId: scriptA.gameId,
		scriptAId,
		scriptBId,
		winnerId,
		rounds: result.totalRounds,
		winsA: result.winsA,
		winsB: result.winsB,
		draws: result.draws,
		scoreA: result.scoreA,
		scoreB: result.scoreB,
		playedAt: new Date()
	});

	return json({
		matchId,
		winner: result.winner,
		winsA: result.winsA,
		winsB: result.winsB,
		draws: result.draws,
		scoreA: result.scoreA,
		scoreB: result.scoreB,
		totalRounds: result.totalRounds
	});
};
