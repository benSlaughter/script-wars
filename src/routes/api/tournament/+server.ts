import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { runTournament } from '$lib/server/tournament';
import { dev } from '$app/environment';

// Legacy endpoint — dev only, or with admin secret
export const POST: RequestHandler = async ({ request }) => {
	if (!dev) {
		const adminSecret = process.env.ADMIN_SECRET;
		const authHeader = request.headers.get('x-admin-secret');
		if (!adminSecret || authHeader !== adminSecret) {
			throw error(403, 'Tournament triggering is disabled');
		}
	}

	try {
		const result = await runTournament('rps');
		return json(result);
	} catch (err) {
		const msg = err instanceof Error ? err.message : 'Tournament failed';
		throw error(400, msg);
	}
};
