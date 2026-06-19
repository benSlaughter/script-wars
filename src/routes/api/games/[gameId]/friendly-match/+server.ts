import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { scripts, matches, users } from '$lib/server/schema';
import { eq, and } from 'drizzle-orm';
import { runMatch } from '$lib/server/engine/match-runner';
import { getGame } from '$lib/server/games';
import { auth } from '$lib/server/auth';
import { checkRateLimit, RATE_LIMITS } from '$lib/server/rate-limit';
import crypto from 'crypto';

export const POST: RequestHandler = async ({ request, params }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) throw error(401, 'Not authenticated');

	const { gameId } = params;
	const game = getGame(gameId);
	if (!game) throw error(404, 'Game not found');

	const { allowed } = checkRateLimit(`friendly:${session.user.id}`, RATE_LIMITS.scriptTest);
	if (!allowed) throw error(429, 'Too many friendly matches. Try again in a minute.');

	const body = await request.json();
	const { opponentScriptId } = body;
	if (!opponentScriptId) throw error(400, 'Missing opponentScriptId');

	// Get the current user's active script for this game
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

	if (!myScript) throw error(400, 'You need an active script to play a friendly match');

	// Get the opponent's script
	const [oppScript] = await db
		.select()
		.from(scripts)
		.where(and(eq(scripts.id, opponentScriptId), eq(scripts.gameId, gameId)));

	if (!oppScript) throw error(404, 'Opponent script not found');
	if (oppScript.userId === session.user.id) throw error(400, "You can't play against yourself");

	// Run the match
	const result = await runMatch(myScript.code, oppScript.code);

	// Get opponent name
	const [opponent] = await db
		.select({ name: users.name })
		.from(users)
		.where(eq(users.id, oppScript.userId));

	// Save to DB as friendly match (no tournament)
	const matchId = crypto.randomUUID();
	await db.insert(matches).values({
		id: matchId,
		gameId,
		tournamentId: null,
		scriptAId: myScript.id,
		scriptBId: oppScript.id,
		winnerId:
			result.winner === 'a' ? myScript.id : result.winner === 'b' ? oppScript.id : null,
		rounds: result.totalRounds,
		winsA: result.winsA,
		winsB: result.winsB,
		draws: result.draws,
		matchType: 'friendly',
		playedAt: new Date()
	});

	return json({
		matchId,
		myScript: myScript.name,
		opponentScript: oppScript.name,
		opponentName: opponent?.name ?? 'Unknown',
		winsA: result.winsA,
		winsB: result.winsB,
		draws: result.draws,
		winner: result.winner,
		rounds: result.rounds
	});
};
