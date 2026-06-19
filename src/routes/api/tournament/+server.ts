import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { runTournament } from '$lib/server/tournament';
import { checkRateLimit, RATE_LIMITS } from '$lib/server/rate-limit';
import { auth } from '$lib/server/auth';

// Legacy endpoint — defaults to RPS
export const POST: RequestHandler = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) throw error(401, 'Not authenticated');

	const { allowed } = checkRateLimit(`tournament:rps:${session.user.id}`, RATE_LIMITS.tournament);
	if (!allowed) throw error(429, 'Too many requests — tournaments are limited to 2 per minute');

	try {
		const result = await runTournament('rps');
		return json(result);
	} catch (err) {
		const msg = err instanceof Error ? err.message : 'Tournament failed';
		throw error(400, msg);
	}
};
