import { executeLuaScript, type ScriptContext } from './sandbox.js';
import { resolveRound, isValidMove, type Move, type RoundResult } from './rps.js';

export interface RoundDetail {
	round: number;
	moveA: Move | null;
	moveB: Move | null;
	result: RoundResult | 'a_error' | 'b_error';
	errorA?: string;
	errorB?: string;
}

export interface MatchResult {
	winsA: number;
	winsB: number;
	draws: number;
	rounds: RoundDetail[];
	totalRounds: number;
	winner: 'a' | 'b' | 'draw';
}

const DEFAULT_ROUNDS = 100;

/**
 * Run a full match between two scripts — best of N rounds.
 */
export async function runMatch(
	codeA: string,
	codeB: string,
	totalRounds: number = DEFAULT_ROUNDS
): Promise<MatchResult> {
	const historyA: string[] = [];
	const historyB: string[] = [];
	const rounds: RoundDetail[] = [];
	let winsA = 0;
	let winsB = 0;
	let draws = 0;

	for (let round = 1; round <= totalRounds; round++) {
		// Build context for each script
		// Script A sees B's history as opponent
		const contextA: ScriptContext = {
			opponent_history: [...historyB],
			my_history: [...historyA],
			round_number: round
		};

		// Script B sees A's history as opponent
		const contextB: ScriptContext = {
			opponent_history: [...historyA],
			my_history: [...historyB],
			round_number: round
		};

		// Execute both scripts
		const [resultA, resultB] = await Promise.all([
			executeLuaScript(codeA, contextA),
			executeLuaScript(codeB, contextB)
		]);

		const moveA = resultA.success && isValidMove(resultA.output) ? resultA.output : null;
		const moveB = resultB.success && isValidMove(resultB.output) ? resultB.output : null;

		// Determine round result
		let result: RoundDetail['result'];

		if (moveA && moveB) {
			// Both valid — normal resolution
			result = resolveRound(moveA, moveB);
		} else if (!moveA && !moveB) {
			// Both errored — draw
			result = 'draw';
		} else if (!moveA) {
			// A errored — B wins
			result = 'b_error';
		} else {
			// B errored — A wins
			result = 'a_error';
		}

		// Update scores
		switch (result) {
			case 'a_wins':
			case 'a_error':
				winsA++;
				break;
			case 'b_wins':
			case 'b_error':
				winsB++;
				break;
			case 'draw':
				draws++;
				break;
		}

		// Record history (use actual move or "error" for tracking)
		historyA.push(moveA ?? 'error');
		historyB.push(moveB ?? 'error');

		rounds.push({
			round,
			moveA,
			moveB,
			result,
			...(resultA.error && { errorA: resultA.error }),
			...(resultB.error && { errorB: resultB.error })
		});
	}

	const winner = winsA > winsB ? 'a' : winsB > winsA ? 'b' : 'draw';

	return {
		winsA,
		winsB,
		draws,
		rounds,
		totalRounds,
		winner
	};
}
