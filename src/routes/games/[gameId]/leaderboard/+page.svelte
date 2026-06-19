<script lang="ts">
	import { authClient } from '$lib/auth-client';

	let { data } = $props();
	let running = $state(false);
	let message = $state('');

	const session = authClient.useSession();

	async function runTournament() {
		running = true;
		message = '';

		const res = await fetch(`/api/games/${data.gameId}/tournament`, { method: 'POST' });

		if (res.ok) {
			const result = await res.json();
			message = `✅ Tournament complete! ${result.matchesPlayed} matches between ${result.participants} players.`;
			setTimeout(() => window.location.reload(), 1500);
		} else {
			const err = await res.json().catch(() => ({ message: 'Failed' }));
			message = `❌ ${err.message}`;
		}

		running = false;
	}
</script>

<div class="leaderboard-header">
	<h1>🏆 Leaderboard</h1>
	{#if $session.data}
		<button class="btn btn-primary" onclick={runTournament} disabled={running}>
			{running ? '⏳ Running...' : '⚔️ Run Tournament'}
		</button>
	{/if}
</div>

{#if message}
	<p class="message">{message}</p>
{/if}

{#if data.entries.length === 0}
	<div class="card empty">
		<p>No battles yet — run a tournament to see rankings!</p>
	</div>
{:else}
	<div class="card">
		<table>
			<thead>
				<tr>
					<th class="rank">#</th>
					<th>Player</th>
					<th>Script</th>
					<th>W</th>
					<th>L</th>
					<th>D</th>
					<th>Win %</th>
				</tr>
			</thead>
			<tbody>
				{#each data.entries as entry, i}
					<tr>
						<td class="rank">{i + 1}</td>
						<td class="player">
							<a href="/player/{entry.userId}">{entry.name}</a>
						</td>
						<td class="script-name">{entry.scriptName}</td>
						<td class="win">{entry.wins}</td>
						<td class="loss">{entry.losses}</td>
						<td class="draw">{entry.draws}</td>
						<td>{entry.winRate}%</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style>
	.leaderboard-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	h1 {
		margin: 0;
	}

	.message {
		margin-bottom: 1rem;
		padding: 0.5rem 1rem;
		border-radius: 0.4rem;
		background: var(--bg-card);
		border: 1px solid var(--border);
		font-size: 0.9rem;
	}

	.empty {
		text-align: center;
		padding: 3rem;
	}

	.empty p {
		color: var(--text-muted);
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th {
		text-align: left;
		padding: 0.75rem;
		border-bottom: 1px solid var(--border);
		color: var(--text-muted);
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	td {
		padding: 0.75rem;
		border-bottom: 1px solid var(--border);
	}

	tr:last-child td {
		border-bottom: none;
	}

	tr:hover td {
		background: var(--bg-hover);
	}

	.rank {
		width: 3rem;
		text-align: center;
		color: var(--text-muted);
	}

	.player {
		font-weight: 600;
	}

	.player a {
		color: var(--text);
	}

	.player a:hover {
		color: var(--accent);
	}

	.script-name {
		color: var(--text-muted);
		font-size: 0.9rem;
	}
</style>
