import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { scripts, matches, users } from '$lib/server/schema';
import { eq, or, and, gte } from 'drizzle-orm';
import { dev } from '$app/environment';
import { getGame } from '$lib/server/games';
import { getLeaderboardRangeStart, parseLeaderboardRange } from '$lib/server/leaderboard-range';

export const load: PageServerLoad = async ({ params, url }) => {
	const { gameId } = params;
	const game = getGame(gameId);
	const range = parseLeaderboardRange(url.searchParams.get('range'));
	const rangeStart = getLeaderboardRangeStart(range);

	// Get all active entries for this game with their match stats
	const activeScripts = await db
		.select({
			userId: users.id,
			userName: users.name,
			scriptId: scripts.id,
			scriptName: scripts.name
		})
		.from(scripts)
		.innerJoin(users, eq(scripts.userId, users.id))
		.where(and(eq(scripts.isActiveEntry, true), eq(scripts.gameId, gameId)));

	// For each active script, calculate stats
	const entries = await Promise.all(
		activeScripts.map(async (entry) => {
			const matchResults = await db
				.select()
				.from(matches)
				.where(
					and(
						eq(matches.gameId, gameId),
						eq(matches.matchType, 'tournament'),
						...(rangeStart ? [gte(matches.playedAt, rangeStart)] : []),
						or(
							eq(matches.scriptAId, entry.scriptId),
							eq(matches.scriptBId, entry.scriptId)
						)
					)
				);

			let wins = 0;
			let losses = 0;
			let draws = 0;
			let totalScore = 0;

			for (const match of matchResults) {
				if (match.winnerId === entry.scriptId) {
					wins++;
				} else if (match.winnerId === null) {
					draws++;
				} else {
					losses++;
				}
				// Accumulate points
				const isA = match.scriptAId === entry.scriptId;
				totalScore += isA ? match.scoreA : match.scoreB;
			}

			const total = wins + losses + draws;
			const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0';

			return {
				userId: entry.userId,
				name: entry.userName,
				scriptName: entry.scriptName,
				wins,
				losses,
				draws,
				total,
				winRate,
				totalScore
			};
		})
	);

	// Sort: point-based games by total score, round-based by wins
	if (game.pointBased) {
		entries.sort((a, b) => b.totalScore - a.totalScore);
	} else {
		entries.sort((a, b) => {
			if (b.wins !== a.wins) return b.wins - a.wins;
			return parseFloat(b.winRate) - parseFloat(a.winRate);
		});
	}

	return { entries, gameId, isDev: dev, pointBased: game.pointBased, range };
};
