import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { runTournament } from '$lib/server/tournament';

export const POST: RequestHandler = async () => {
	try {
		const result = await runTournament();
		return json(result);
	} catch (err) {
		const msg = err instanceof Error ? err.message : 'Tournament failed';
		throw error(400, msg);
	}
};
