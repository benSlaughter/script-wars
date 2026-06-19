import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { executeLuaScript } from '$lib/server/engine';
import { auth } from '$lib/server/auth';
import { checkRateLimit, RATE_LIMITS } from '$lib/server/rate-limit';

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) throw error(401, 'Not authenticated');

	const { allowed } = checkRateLimit(`test:${session.user.id}`, RATE_LIMITS.scriptTest);
	if (!allowed) throw error(429, 'Too many test requests — try again in a minute');

	const body = await request.json();
	const { code } = body;

	if (!code || typeof code !== 'string') {
		throw error(400, 'Code is required');
	}
	if (code.length > 10000) {
		throw error(400, 'Code must be under 10,000 characters');
	}

	const VALID_MOVES = ['rock', 'paper', 'scissors'];

	// Run 3 test rounds to show the script works
	const results = [];
	const history: string[] = [];
	const issues: string[] = [];

	for (let round = 1; round <= 3; round++) {
		const result = await executeLuaScript(code, {
			opponent_history: history.map(() => 'rock'), // simulate opponent always playing rock
			my_history: history,
			round_number: round
		});

		let warning: string | null = null;

		if (result.success) {
			if (!result.output) {
				warning = 'Script did not return a value — this counts as a forfeit in matches';
			} else if (!VALID_MOVES.includes(result.output)) {
				warning = `Returned "${result.output}" — must be "rock", "paper", or "scissors". This counts as a forfeit in matches.`;
			}
		}

		results.push({
			round,
			...result,
			warning
		});

		if (result.success && result.output) {
			history.push(result.output);
		}
	}

	// Summarise issues
	const hasErrors = results.some((r) => !r.success);
	const hasWarnings = results.some((r) => r.warning);

	return json({ results, hasErrors, hasWarnings });
};
