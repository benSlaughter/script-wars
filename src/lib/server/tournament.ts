import { db } from '$lib/server/db';
import { scripts, matches, tournaments, users } from '$lib/server/schema';
import { eq, and } from 'drizzle-orm';
import { runMatch } from '$lib/server/engine';
import { nanoid } from 'nanoid';

/**
 * Run a full round-robin tournament.
 * Every active entry plays every other active entry.
 */
export async function runTournament(): Promise<{
	tournamentId: string;
	matchesPlayed: number;
	participants: number;
}> {
	// Get all active entries
	const activeScripts = await db
		.select({
			scriptId: scripts.id,
			userId: scripts.userId,
			code: scripts.code,
			scriptName: scripts.name,
			userName: users.name
		})
		.from(scripts)
		.innerJoin(users, eq(scripts.userId, users.id))
		.where(eq(scripts.isActiveEntry, true));

	if (activeScripts.length < 2) {
		throw new Error('Need at least 2 active entries to run a tournament');
	}

	// Create tournament record
	const tournamentId = nanoid();
	const now = new Date();

	await db.insert(tournaments).values({
		id: tournamentId,
		status: 'running',
		startedAt: now,
		createdAt: now
	});

	let matchesPlayed = 0;

	// Round-robin: every entry plays every other entry
	for (let i = 0; i < activeScripts.length; i++) {
		for (let j = i + 1; j < activeScripts.length; j++) {
			const scriptA = activeScripts[i];
			const scriptB = activeScripts[j];

			// Run the match (100 rounds)
			const result = await runMatch(scriptA.code, scriptB.code, 100);

			const winnerId =
				result.winner === 'a'
					? scriptA.scriptId
					: result.winner === 'b'
						? scriptB.scriptId
						: null;

			// Store result
			await db.insert(matches).values({
				id: nanoid(),
				tournamentId,
				scriptAId: scriptA.scriptId,
				scriptBId: scriptB.scriptId,
				winnerId,
				rounds: result.totalRounds,
				winsA: result.winsA,
				winsB: result.winsB,
				draws: result.draws,
				playedAt: new Date()
			});

			matchesPlayed++;
		}
	}

	// Mark tournament complete
	await db
		.update(tournaments)
		.set({ status: 'complete', completedAt: new Date() })
		.where(eq(tournaments.id, tournamentId));

	return {
		tournamentId,
		matchesPlayed,
		participants: activeScripts.length
	};
}
