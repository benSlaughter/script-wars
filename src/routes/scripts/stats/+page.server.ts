import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { scripts, matches, users } from '$lib/server/schema';
import { eq, or } from 'drizzle-orm';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) throw error(401, 'Not authenticated');

	// Get all user's scripts
	const userScripts = await db
		.select()
		.from(scripts)
		.where(eq(scripts.userId, session.user.id));

	// For each script, get matchup breakdown
	const scriptStats = await Promise.all(
		userScripts.map(async (script) => {
			const scriptMatches = await db
				.select()
				.from(matches)
				.where(or(eq(matches.scriptAId, script.id), eq(matches.scriptBId, script.id)));

			let wins = 0;
			let losses = 0;
			let draws = 0;
			const opponents: Record<string, { name: string; wins: number; losses: number; draws: number }> = {};

			for (const match of scriptMatches) {
				const isA = match.scriptAId === script.id;
				const opponentId = isA ? match.scriptBId : match.scriptAId;

				if (!opponents[opponentId]) {
					// Look up opponent name
					const [opScript] = await db.select({ userId: scripts.userId, name: scripts.name }).from(scripts).where(eq(scripts.id, opponentId));
					let opName = 'Unknown';
					if (opScript) {
						const [opUser] = await db.select({ name: users.name }).from(users).where(eq(users.id, opScript.userId));
						if (opUser) opName = opUser.name;
					}
					opponents[opponentId] = { name: opName, wins: 0, losses: 0, draws: 0 };
				}

				if (match.winnerId === script.id) {
					wins++;
					opponents[opponentId].wins++;
				} else if (match.winnerId === null) {
					draws++;
					opponents[opponentId].draws++;
				} else {
					losses++;
					opponents[opponentId].losses++;
				}
			}

			return {
				id: script.id,
				name: script.name,
				isActive: script.isActiveEntry,
				wins,
				losses,
				draws,
				opponents: Object.values(opponents)
			};
		})
	);

	return { scriptStats };
};
