import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { runTournament } from '$lib/server/tournament';
import { isValidGame } from '$lib/server/games';
import { dev } from '$app/environment';

// Manual tournament trigger — dev only, or with admin secret
export const POST: RequestHandler = async ({ request, params }) => {
	const { gameId } = params;
	if (!isValidGame(gameId)) throw error(404, 'Game not found');

	if (!dev) {
		const adminSecret = process.env.ADMIN_SECRET;
		const authHeader = request.headers.get('x-admin-secret');
		if (!adminSecret || authHeader !== adminSecret) {
			throw error(403, 'Tournament triggering is disabled — tournaments run automatically every hour');
		}
	}

	try {
		const result = await runTournament(gameId);
		return json(result);
	} catch (err) {
		const msg = err instanceof Error ? err.message : 'Tournament failed';
		throw error(400, msg);
	}
};
