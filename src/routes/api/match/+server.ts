import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { runMatch } from '$lib/server/engine';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { scripts, matches, tournaments } from '$lib/server/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const POST: RequestHandler = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) throw error(401, 'Not authenticated');

	const body = await request.json();
	const { scriptAId, scriptBId, rounds = 100 } = body;

	if (!scriptAId || !scriptBId) {
		throw error(400, 'Two script IDs are required');
	}

	if (rounds < 1 || rounds > 1000) {
		throw error(400, 'Rounds must be between 1 and 1000');
	}

	// Fetch both scripts
	const [scriptA] = await db.select().from(scripts).where(eq(scripts.id, scriptAId));
	const [scriptB] = await db.select().from(scripts).where(eq(scripts.id, scriptBId));

	if (!scriptA || !scriptB) {
		throw error(404, 'One or both scripts not found');
	}

	// Run the match
	const result = await runMatch(scriptA.code, scriptB.code, rounds);

	// Store the result
	const matchId = nanoid();
	const winnerId =
		result.winner === 'a' ? scriptAId : result.winner === 'b' ? scriptBId : null;

	await db.insert(matches).values({
		id: matchId,
		scriptAId,
		scriptBId,
		winnerId,
		rounds: result.totalRounds,
		winsA: result.winsA,
		winsB: result.winsB,
		draws: result.draws,
		playedAt: new Date()
	});

	return json({
		matchId,
		winner: result.winner,
		winsA: result.winsA,
		winsB: result.winsB,
		draws: result.draws,
		totalRounds: result.totalRounds,
		// Only return first 10 round details (to keep response small)
		sampleRounds: result.rounds.slice(0, 10)
	});
};
