import { describe, it, expect } from 'vitest';
import {
	parseLeaderboardRange,
	getLeaderboardRangeStart
} from '../src/lib/server/leaderboard-range';

describe('leaderboard timescales', () => {
	it('defaults invalid or missing range to month', () => {
		expect(parseLeaderboardRange(null)).toBe('month');
		expect(parseLeaderboardRange('bad')).toBe('month');
	});

	it('accepts supported ranges', () => {
		expect(parseLeaderboardRange('day')).toBe('day');
		expect(parseLeaderboardRange('week')).toBe('week');
		expect(parseLeaderboardRange('month')).toBe('month');
		expect(parseLeaderboardRange('all')).toBe('all');
	});

	it('calculates start time for day/week/month and all', () => {
		const now = new Date('2026-06-21T09:00:00.000Z');
		expect(getLeaderboardRangeStart('day', now)?.toISOString()).toBe('2026-06-20T09:00:00.000Z');
		expect(getLeaderboardRangeStart('week', now)?.toISOString()).toBe('2026-06-14T09:00:00.000Z');
		expect(getLeaderboardRangeStart('month', now)?.toISOString()).toBe('2026-05-22T09:00:00.000Z');
		expect(getLeaderboardRangeStart('all', now)).toBeNull();
	});
});
