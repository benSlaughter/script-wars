import { describe, it, expect } from 'vitest';
import { runMatch } from '../src/lib/server/engine/match-runner';

describe('Match Runner', () => {
	it('runs a match between two simple scripts', async () => {
		const result = await runMatch(
			'return "rock"',
			'return "scissors"',
			10
		);

		expect(result.winsA).toBe(10);
		expect(result.winsB).toBe(0);
		expect(result.draws).toBe(0);
		expect(result.winner).toBe('a');
		expect(result.totalRounds).toBe(10);
		expect(result.rounds).toHaveLength(10);
	});

	it('handles draws correctly', async () => {
		const result = await runMatch(
			'return "rock"',
			'return "rock"',
			5
		);

		expect(result.winsA).toBe(0);
		expect(result.winsB).toBe(0);
		expect(result.draws).toBe(5);
		expect(result.winner).toBe('draw');
	});

	it('gives win to opponent when script errors', async () => {
		const result = await runMatch(
			'return "rock"',
			'this is broken',
			5
		);

		// B errors = A wins those rounds via 'a_error' result
		// Actually: B errors, so B gets no valid move, A wins
		expect(result.winsA).toBe(5);
		expect(result.winsB).toBe(0);
		expect(result.winner).toBe('a');
	});

	it('provides history context across rounds', async () => {
		// Script A counters B's last move
		const counterScript = `
			if #opponent_history == 0 then
				return "rock"
			end
			local last = opponent_history[#opponent_history]
			local counter = { rock = "paper", paper = "scissors", scissors = "rock" }
			return counter[last]
		`;

		// Script B always plays rock
		const result = await runMatch(counterScript, 'return "rock"', 10);

		// Round 1: A plays rock (no history), B plays rock → draw
		// Round 2+: A plays paper (counters B's rock), B plays rock → A wins
		expect(result.winsA).toBe(9);
		expect(result.draws).toBe(1);
		expect(result.winner).toBe('a');
	});

	it('passes round_number correctly', async () => {
		const result = await runMatch(
			'if round_number == 1 then return "rock" else return "paper" end',
			'return "scissors"',
			3
		);

		// Round 1: rock vs scissors → A wins
		// Round 2-3: paper vs scissors → B wins
		expect(result.winsA).toBe(1);
		expect(result.winsB).toBe(2);
		expect(result.winner).toBe('b');
	});

	it('handles both scripts erroring', async () => {
		const result = await runMatch(
			'error("boom")',
			'error("crash")',
			3
		);

		// Both error → draw
		expect(result.draws).toBe(3);
		expect(result.winner).toBe('draw');
	});

	it('treats invalid move as forfeit (opponent wins)', async () => {
		const result = await runMatch(
			'return "banana"', // invalid move
			'return "rock"',
			5
		);

		// A always returns invalid → B wins every round
		expect(result.winsB).toBe(5);
		expect(result.winsA).toBe(0);
		expect(result.winner).toBe('b');
	});

	it('treats erroring script as forfeit (opponent wins)', async () => {
		const result = await runMatch(
			'error("oops")',
			'return "paper"',
			5
		);

		expect(result.winsB).toBe(5);
		expect(result.winner).toBe('b');
	});
});
