export type Move = 'rock' | 'paper' | 'scissors';

export const VALID_MOVES: Move[] = ['rock', 'paper', 'scissors'];

export type RoundResult = 'a_wins' | 'b_wins' | 'draw';

/**
 * Determine the winner of a single Rock Paper Scissors round.
 */
export function resolveRound(moveA: Move, moveB: Move): RoundResult {
	if (moveA === moveB) return 'draw';

	const winsAgainst: Record<Move, Move> = {
		rock: 'scissors',
		paper: 'rock',
		scissors: 'paper'
	};

	return winsAgainst[moveA] === moveB ? 'a_wins' : 'b_wins';
}

/**
 * Validate that a string is a valid RPS move.
 */
export function isValidMove(move: string | null): move is Move {
	return move !== null && VALID_MOVES.includes(move as Move);
}
