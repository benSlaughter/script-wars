import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users, scripts, matches } from '$lib/server/schema';
import { eq, or } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const [user] = await db.select().from(users).where(eq(users.id, params.id));

	if (!user) throw error(404, 'Player not found');

	// Get their active script
	const [activeScript] = await db
		.select()
		.from(scripts)
		.where(eq(scripts.userId, user.id));

	// Get all matches involving their scripts
	const userScripts = await db
		.select({ id: scripts.id })
		.from(scripts)
		.where(eq(scripts.userId, user.id));

	const scriptIds = userScripts.map((s) => s.id);

	let wins = 0;
	let losses = 0;
	let draws = 0;
	const recentMatches: {
		opponentName: string;
		result: string;
		winsA: number;
		winsB: number;
		drawCount: number;
		playedAt: string;
	}[] = [];

	if (scriptIds.length > 0) {
		for (const scriptId of scriptIds) {
			const scriptMatches = await db
				.select()
				.from(matches)
				.where(or(eq(matches.scriptAId, scriptId), eq(matches.scriptBId, scriptId)));

			for (const match of scriptMatches) {
				if (match.winnerId && scriptIds.includes(match.winnerId)) {
					wins++;
				} else if (match.winnerId === null) {
					draws++;
				} else {
					losses++;
				}
			}
		}

		// Get recent matches for display
		const activeId = activeScript?.id;
		if (activeId) {
			const recent = await db
				.select()
				.from(matches)
				.where(or(eq(matches.scriptAId, activeId), eq(matches.scriptBId, activeId)))
				.orderBy(matches.playedAt)
				.limit(10);

			for (const match of recent) {
				const opponentScriptId =
					match.scriptAId === activeId ? match.scriptBId : match.scriptAId;

				const [opponentScript] = await db
					.select({ userId: scripts.userId })
					.from(scripts)
					.where(eq(scripts.id, opponentScriptId));

				let opponentName = 'Unknown';
				if (opponentScript) {
					const [opponent] = await db
						.select({ name: users.name })
						.from(users)
						.where(eq(users.id, opponentScript.userId));
					if (opponent) opponentName = opponent.name;
				}

				const isA = match.scriptAId === activeId;
				const result =
					match.winnerId === activeId ? 'win' : match.winnerId === null ? 'draw' : 'loss';

				recentMatches.push({
					opponentName,
					result,
					winsA: isA ? match.winsA : match.winsB,
					winsB: isA ? match.winsB : match.winsA,
					drawCount: match.draws,
					playedAt: match.playedAt?.toISOString() ?? ''
				});
			}
		}
	}

	const total = wins + losses + draws;
	const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0';

	return {
		player: { name: user.name, createdAt: user.createdAt?.toISOString() ?? '' },
		stats: { wins, losses, draws, total, winRate },
		recentMatches
	};
};
