import { describe, it, expect } from 'vitest';
import { runMatch } from '../src/lib/server/engine/match-runner';
import type { GameFunctions } from '../src/lib/server/engine/match-runner';

// Prisoner's Dilemma game functions for testing
const pdGame: GameFunctions = {
	isValidMove: (m: string) => m === 'share' || m === 'steal',
	resolveRound: (a: string, b: string) => {
		if (a === b) return 'draw';
		return a === 'steal' ? 'a' : 'b';
	},
	getPoints: (a: string, b: string) => {
		if (a === 'share' && b === 'share') return [3, 3];
		if (a === 'share' && b === 'steal') return [0, 5];
		if (a === 'steal' && b === 'share') return [5, 0];
		return [1, 1]; // steal/steal
	},
	buildContext: (round, myHistory, opponentHistory) => ({
		opponent_history: opponentHistory,
		my_history: myHistory,
		round_number: round
	}),
	pointBased: true
};

describe('Prisoner\'s Dilemma scoring', () => {
	it('mutual cooperation scores 3 points each per round', async () => {
		const result = await runMatch(
			'return "share"',
			'return "share"',
			10,
			pdGame
		);

		expect(result.scoreA).toBe(30);
		expect(result.scoreB).toBe(30);
		expect(result.winner).toBe('draw');
	});

	it('mutual stealing scores 1 point each per round', async () => {
		const result = await runMatch(
			'return "steal"',
			'return "steal"',
			10,
			pdGame
		);

		expect(result.scoreA).toBe(10);
		expect(result.scoreB).toBe(10);
		expect(result.winner).toBe('draw');
	});

	it('stealer beats sharer on points', async () => {
		const result = await runMatch(
			'return "steal"',
			'return "share"',
			10,
			pdGame
		);

		expect(result.scoreA).toBe(50); // 5 * 10
		expect(result.scoreB).toBe(0);  // 0 * 10
		expect(result.winner).toBe('a');
	});

	it('winner determined by total score not round wins', async () => {
		// A shares for 8 rounds then steals for 2 → gets 3*8 + 5*2 = 34
		// B always shares → gets 3*8 + 0*2 = 24
		const result = await runMatch(
			'if round_number <= 8 then return "share" else return "steal" end',
			'return "share"',
			10,
			pdGame
		);

		expect(result.scoreA).toBe(34);
		expect(result.scoreB).toBe(24);
		expect(result.winner).toBe('a');
	});

	it('tit-for-tat strategy works via history', async () => {
		// A: tit for tat (start share, copy opponent)
		// B: always steal
		// Round 1: A shares, B steals → A=0, B=5
		// Round 2+: A steals, B steals → each gets 1
		const result = await runMatch(
			`if #opponent_history == 0 then return "share" end
			 return opponent_history[#opponent_history]`,
			'return "steal"',
			10,
			pdGame
		);

		expect(result.scoreA).toBe(0 + 9); // 0 for round 1, 1*9 for rest
		expect(result.scoreB).toBe(5 + 9); // 5 for round 1, 1*9 for rest
		expect(result.winner).toBe('b');
	});
});

describe('Match Runner with game functions', () => {
	it('error in point-based game gives opponent forfeit points', async () => {
		const result = await runMatch(
			'return "share"',
			'error("broken")',
			5,
			pdGame
		);

		// B errors every round → A gets forfeit points (5 per round)
		expect(result.scoreA).toBe(25); // 5 * 5 rounds
		expect(result.scoreB).toBe(0);
		expect(result.winner).toBe('a');
	});

	it('both scripts erroring in point-based game scores 0-0', async () => {
		const result = await runMatch(
			'error("boom")',
			'error("crash")',
			5,
			pdGame
		);

		expect(result.scoreA).toBe(0);
		expect(result.scoreB).toBe(0);
		expect(result.draws).toBe(5);
		expect(result.winner).toBe('draw');
	});

	it('invalid move treated as forfeit in point-based game', async () => {
		const result = await runMatch(
			'return "banana"',  // invalid
			'return "share"',
			5,
			pdGame
		);

		// A returns invalid → B wins each round with forfeit points
		expect(result.scoreB).toBe(25); // 5 * 5 rounds
		expect(result.scoreA).toBe(0);
		expect(result.winner).toBe('b');
	});

	it('returns correct round details with game functions', async () => {
		const result = await runMatch(
			'return "share"',
			'return "steal"',
			3,
			pdGame
		);

		expect(result.rounds).toHaveLength(3);
		expect(result.rounds[0].moveA).toBe('share');
		expect(result.rounds[0].moveB).toBe('steal');
		// In PD, steal beats share
		expect(result.rounds[0].result).toBe('b_wins');
	});

	it('scoreA and scoreB are 0 for non-point-based games', async () => {
		// Default RPS (no game functions passed)
		const result = await runMatch(
			'return "rock"',
			'return "scissors"',
			5
		);

		// RPS is not point-based, but score still accumulates (1 per win)
		expect(result.scoreA).toBe(5);
		expect(result.scoreB).toBe(0);
		expect(result.winner).toBe('a');
	});

	it('error in round-based game gives opponent 1 forfeit point', async () => {
		// Default RPS
		const result = await runMatch(
			'return "rock"',
			'error("broken")',
			5
		);

		expect(result.winsA).toBe(5);
		expect(result.scoreA).toBe(5); // 1 per forfeit win
		expect(result.winner).toBe('a');
	});
});
