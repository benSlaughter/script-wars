import { db } from '$lib/server/db';
import { scripts, matches, tournaments, users } from '$lib/server/schema';
import { eq, and } from 'drizzle-orm';
import { runMatch } from '$lib/server/engine';
import { nanoid } from 'nanoid';
import { getGame } from '$lib/server/games';

/**
 * Run a full round-robin tournament for a specific game.
 * Every active entry plays every other active entry.
 */
export async function runTournament(gameId: string): Promise<{
	tournamentId: string;
	matchesPlayed: number;
	participants: number;
}> {
	const game = getGame(gameId);

	// Get all active entries for this game
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
		.where(and(eq(scripts.isActiveEntry, true), eq(scripts.gameId, gameId)));

	if (activeScripts.length < 2) {
		throw new Error('Need at least 2 active entries to run a tournament');
	}

	// Create tournament record
	const tournamentId = nanoid();
	const now = new Date();

	await db.insert(tournaments).values({
		id: tournamentId,
		gameId,
		status: 'running',
		startedAt: now,
		createdAt: now
	});

	let matchesPlayed = 0;

	try {
		// Round-robin: every entry plays every other entry
		for (let i = 0; i < activeScripts.length; i++) {
			for (let j = i + 1; j < activeScripts.length; j++) {
				const scriptA = activeScripts[i];
				const scriptB = activeScripts[j];

				const result = await runMatch(scriptA.code, scriptB.code, game.maxRounds, {
					isValidMove: (m) => game.isValidMove(m),
					resolveRound: (a, b) => game.resolveRound(a, b),
					getPoints: (a, b) => game.getPoints(a, b),
					buildContext: (r, my, opp) => game.buildContext(r, my, opp),
					pointBased: game.pointBased
				});

				const winnerId =
					result.winner === 'a'
						? scriptA.scriptId
						: result.winner === 'b'
							? scriptB.scriptId
							: null;

				await db.insert(matches).values({
					id: nanoid(),
					gameId,
					tournamentId,
					scriptAId: scriptA.scriptId,
					scriptBId: scriptB.scriptId,
					winnerId,
					rounds: result.totalRounds,
					winsA: result.winsA,
					winsB: result.winsB,
					draws: result.draws,
					scoreA: result.scoreA,
					scoreB: result.scoreB,
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
	} catch (err) {
		// Mark tournament as failed so it doesn't stay "running" forever
		await db
			.update(tournaments)
			.set({ status: 'failed', completedAt: new Date() })
			.where(eq(tournaments.id, tournamentId));
		throw err;
	}

	return {
		tournamentId,
		matchesPlayed,
		participants: activeScripts.length
	};
}
