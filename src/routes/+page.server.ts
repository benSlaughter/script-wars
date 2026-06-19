import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users, scripts, matches, tournaments } from '$lib/server/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getAllGames } from '$lib/server/games';

export const load: PageServerLoad = async () => {
	const [playerCount] = await db
		.select({ count: sql<number>`count(*)` })
		.from(users);

	const [scriptCount] = await db
		.select({ count: sql<number>`count(*)` })
		.from(scripts);

	const [matchCount] = await db
		.select({ count: sql<number>`count(*)` })
		.from(matches)
		.where(eq(matches.matchType, 'tournament'));

	const [tournamentCount] = await db
		.select({ count: sql<number>`count(*)` })
		.from(tournaments)
		.where(eq(tournaments.status, 'complete'));

	// Get latest completed tournament's top 3
	const [latestTournament] = await db
		.select()
		.from(tournaments)
		.where(eq(tournaments.status, 'complete'))
		.orderBy(desc(tournaments.completedAt))
		.limit(1);

	let topPlayers: { name: string; scriptName: string; wins: number }[] = [];

	if (latestTournament) {
		const tournamentMatches = await db
			.select()
			.from(matches)
			.where(eq(matches.tournamentId, latestTournament.id));

		const scoreMap: Record<string, number> = {};
		for (const match of tournamentMatches) {
			if (match.winnerId) {
				scoreMap[match.winnerId] = (scoreMap[match.winnerId] ?? 0) + 1;
			}
		}

		const sorted = Object.entries(scoreMap)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 3);

		topPlayers = await Promise.all(
			sorted.map(async ([scriptId, wins]) => {
				const [script] = await db
					.select({ name: scripts.name, userId: scripts.userId })
					.from(scripts)
					.where(eq(scripts.id, scriptId));

				let playerName = 'Unknown';
				if (script) {
					const [user] = await db
						.select({ name: users.name })
						.from(users)
						.where(eq(users.id, script.userId));
					if (user) playerName = user.name;
				}

				return { name: playerName, scriptName: script?.name ?? '?', wins };
			})
		);
	}

	// Next tournament: top of next hour
	const now = new Date();
	const nextHour = new Date(now);
	nextHour.setMinutes(0, 0, 0);
	nextHour.setHours(nextHour.getHours() + 1);
	const minutesUntilNext = Math.ceil((nextHour.getTime() - now.getTime()) / 60000);

	const games = getAllGames().map((g) => ({
		id: g.id,
		name: g.name,
		description: g.description,
		icon: g.icon
	}));

	return {
		stats: {
			players: playerCount.count,
			scripts: scriptCount.count,
			matches: matchCount.count,
			tournaments: tournamentCount.count
		},
		topPlayers,
		minutesUntilNext,
		games
	};
};
