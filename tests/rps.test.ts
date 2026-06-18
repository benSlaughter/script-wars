import { describe, it, expect } from 'vitest';
import { resolveRound, isValidMove } from '../src/lib/server/engine/rps';

describe('Rock Paper Scissors Rules', () => {
	it('rock beats scissors', () => {
		expect(resolveRound('rock', 'scissors')).toBe('a_wins');
	});

	it('scissors beats paper', () => {
		expect(resolveRound('scissors', 'paper')).toBe('a_wins');
	});

	it('paper beats rock', () => {
		expect(resolveRound('paper', 'rock')).toBe('a_wins');
	});

	it('scissors loses to rock', () => {
		expect(resolveRound('scissors', 'rock')).toBe('b_wins');
	});

	it('paper loses to scissors', () => {
		expect(resolveRound('paper', 'scissors')).toBe('b_wins');
	});

	it('rock loses to paper', () => {
		expect(resolveRound('rock', 'paper')).toBe('b_wins');
	});

	it('same move is a draw', () => {
		expect(resolveRound('rock', 'rock')).toBe('draw');
		expect(resolveRound('paper', 'paper')).toBe('draw');
		expect(resolveRound('scissors', 'scissors')).toBe('draw');
	});
});

describe('Move Validation', () => {
	it('accepts valid moves', () => {
		expect(isValidMove('rock')).toBe(true);
		expect(isValidMove('paper')).toBe(true);
		expect(isValidMove('scissors')).toBe(true);
	});

	it('rejects invalid moves', () => {
		expect(isValidMove('banana')).toBe(false);
		expect(isValidMove('')).toBe(false);
		expect(isValidMove(null)).toBe(false);
		expect(isValidMove('ROCK')).toBe(false); // case sensitive
	});
});
