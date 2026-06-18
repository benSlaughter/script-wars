import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { executeLuaScript } from '$lib/server/engine';
import { auth } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) throw error(401, 'Not authenticated');

	const body = await request.json();
	const { code } = body;

	if (!code || typeof code !== 'string') {
		throw error(400, 'Code is required');
	}
	if (code.length > 10000) {
		throw error(400, 'Code must be under 10,000 characters');
	}

	// Run 3 test rounds to show the script works
	const results = [];
	const history: string[] = [];

	for (let round = 1; round <= 3; round++) {
		const result = await executeLuaScript(code, {
			opponent_history: history.map(() => 'rock'), // simulate opponent always playing rock
			my_history: history,
			round_number: round
		});

		results.push({
			round,
			...result
		});

		if (result.success && result.output) {
			history.push(result.output);
		}
	}

	return json({ results });
};
