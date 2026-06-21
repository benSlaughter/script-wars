export const leaderboardRanges = ['day', 'week', 'month', 'all'] as const;
export type LeaderboardRange = (typeof leaderboardRanges)[number];

export function parseLeaderboardRange(range: string | null): LeaderboardRange {
	if (range && leaderboardRanges.includes(range as LeaderboardRange)) {
		return range as LeaderboardRange;
	}
	return 'month';
}

export function getLeaderboardRangeStart(range: LeaderboardRange, now = new Date()): Date | null {
	if (range === 'all') return null;

	const start = new Date(now);
	if (range === 'day') {
		start.setDate(start.getDate() - 1);
	} else if (range === 'week') {
		start.setDate(start.getDate() - 7);
	} else {
		start.setDate(start.getDate() - 30);
	}
	return start;
}
