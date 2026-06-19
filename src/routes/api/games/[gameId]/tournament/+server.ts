import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { runTournament } from '$lib/server/tournament';
import { checkRateLimit, RATE_LIMITS } from '$lib/server/rate-limit';
import { isValidGame } from '$lib/server/games';

export const POST: RequestHandler = async ({ getClientAddress, params }) => {
	const { gameId } = params;
	if (!isValidGame(gameId)) throw error(404, 'Game not found');

	const ip = getClientAddress();
	const { allowed } = checkRateLimit(`tournament:${gameId}:${ip}`, RATE_LIMITS.tournament);
	if (!allowed) throw error(429, 'Too many requests — tournaments are limited to 2 per minute');

	try {
		const result = await runTournament(gameId);
		return json(result);
	} catch (err) {
		const msg = err instanceof Error ? err.message : 'Tournament failed';
		throw error(400, msg);
	}
};
