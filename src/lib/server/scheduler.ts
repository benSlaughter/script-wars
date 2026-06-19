import { runTournament } from './tournament.js';
import { getAllGames } from './games/index.js';

const TOURNAMENT_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
let schedulerStarted = false;

/**
 * Run tournaments for all registered games.
 */
async function runAllTournaments() {
	const games = getAllGames();
	for (const game of games) {
		try {
			const result = await runTournament(game.id);
			console.log(
				`🏆 [${game.name}] Tournament complete: ${result.matchesPlayed} matches, ${result.participants} players`
			);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			// "Need at least 2" is expected when not enough players — don't spam logs
			if (!msg.includes('at least 2')) {
				console.error(`❌ [${game.name}] Tournament failed:`, msg);
			}
		}
	}
}

/**
 * Start the hourly tournament scheduler.
 * Runs at the top of every hour.
 */
export function startScheduler() {
	if (schedulerStarted) return;
	schedulerStarted = true;

	// Calculate ms until next top-of-hour
	const now = new Date();
	const msUntilNextHour =
		(60 - now.getMinutes()) * 60 * 1000 -
		now.getSeconds() * 1000 -
		now.getMilliseconds();

	console.log(
		`⏰ Tournament scheduler started — next run in ${Math.round(msUntilNextHour / 1000 / 60)}m`
	);

	// First run at top of next hour
	setTimeout(() => {
		runAllTournaments();

		// Then every hour after that
		setInterval(runAllTournaments, TOURNAMENT_INTERVAL_MS);
	}, msUntilNextHour);
}
