import { executeLuaScript, type ScriptContext } from './sandbox.js';

export interface RoundDetail {
	round: number;
	moveA: string | null;
	moveB: string | null;
	result: 'a_wins' | 'b_wins' | 'draw' | 'a_error' | 'b_error';
	errorA?: string;
	errorB?: string;
}

export interface MatchResult {
	winsA: number;
	winsB: number;
	draws: number;
	scoreA: number;
	scoreB: number;
	rounds: RoundDetail[];
	totalRounds: number;
	winner: 'a' | 'b' | 'draw';
}

export interface GameFunctions {
	isValidMove(move: string): boolean;
	resolveRound(moveA: string, moveB: string): 'a' | 'b' | 'draw';
	getPoints(moveA: string, moveB: string): [number, number];
	buildContext(round: number, myHistory: string[], opponentHistory: string[]): ScriptContext;
	pointBased?: boolean;
}

const DEFAULT_ROUNDS = 100;

/**
 * Run a full match between two scripts using the given game functions.
 */
export async function runMatch(
	codeA: string,
	codeB: string,
	totalRounds: number = DEFAULT_ROUNDS,
	game?: GameFunctions
): Promise<MatchResult> {
	const historyA: string[] = [];
	const historyB: string[] = [];
	const rounds: RoundDetail[] = [];
	let winsA = 0;
	let winsB = 0;
	let draws = 0;
	let scoreA = 0;
	let scoreB = 0;

	// Default game functions (RPS) for backward compatibility
	const gameFns = game ?? await getDefaultGame();
	const { isValidMove, resolveRound, buildContext, getPoints } = gameFns;

	for (let round = 1; round <= totalRounds; round++) {
		const contextA: ScriptContext = buildContext(round, historyA, historyB);
		const contextB: ScriptContext = buildContext(round, historyB, historyA);

		const [resultA, resultB] = await Promise.all([
			executeLuaScript(codeA, contextA),
			executeLuaScript(codeB, contextB)
		]);

		const moveA = resultA.success && isValidMove(resultA.output) ? resultA.output : null;
		const moveB = resultB.success && isValidMove(resultB.output) ? resultB.output : null;

		let result: RoundDetail['result'];

		if (moveA && moveB) {
			const resolution = resolveRound(moveA, moveB);
			result = resolution === 'a' ? 'a_wins' : resolution === 'b' ? 'b_wins' : 'draw';
			// Accumulate points
			const [ptsA, ptsB] = getPoints(moveA, moveB);
			scoreA += ptsA;
			scoreB += ptsB;
		} else if (!moveA && !moveB) {
			result = 'draw';
		} else if (!moveA) {
			result = 'b_error';
			scoreB += 5; // Error = opponent gets max points
		} else {
			result = 'a_error';
			scoreA += 5;
		}

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

	// Point-based games: winner determined by total score
	// Round-based games: winner determined by rounds won
	const winner = gameFns.pointBased
		? (scoreA > scoreB ? 'a' : scoreB > scoreA ? 'b' : 'draw')
		: (winsA > winsB ? 'a' : winsB > winsA ? 'b' : 'draw');

	return {
		winsA,
		winsB,
		draws,
		scoreA,
		scoreB,
		rounds,
		totalRounds,
		winner
	};
}

// Lazy-load default RPS game to avoid circular imports
async function getDefaultGame(): Promise<GameFunctions> {
	const { resolveRound, isValidMove } = await import('./rps.js');
	return {
		isValidMove: (move: string) => isValidMove(move),
		resolveRound: (a: string, b: string) => {
			const r = resolveRound(a as any, b as any);
			return r === 'a_wins' ? 'a' : r === 'b_wins' ? 'b' : 'draw';
		},
		getPoints: (a: string, b: string) => {
			const r = resolveRound(a as any, b as any);
			if (r === 'a_wins') return [1, 0];
			if (r === 'b_wins') return [0, 1];
			return [0, 0];
		},
		buildContext: (round, myHistory, opponentHistory) => ({
			opponent_history: opponentHistory,
			my_history: myHistory,
			round_number: round
		}),
		pointBased: false
	};
}
