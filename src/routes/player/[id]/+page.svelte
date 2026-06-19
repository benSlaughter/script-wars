<script lang="ts">
	let { data } = $props();
</script>

<div class="profile">
	<div class="profile-header card">
		<h1>{data.player.name}</h1>
		<div class="stats-grid">
			<div class="stat">
				<span class="stat-value win">{data.stats.wins}</span>
				<span class="stat-label">Wins</span>
			</div>
			<div class="stat">
				<span class="stat-value loss">{data.stats.losses}</span>
				<span class="stat-label">Losses</span>
			</div>
			<div class="stat">
				<span class="stat-value draw">{data.stats.draws}</span>
				<span class="stat-label">Draws</span>
			</div>
			<div class="stat">
				<span class="stat-value">{data.stats.winRate}%</span>
				<span class="stat-label">Win Rate</span>
			</div>
		</div>
	</div>

	{#if data.recentMatches.length > 0}
		<h2>Recent Matches</h2>
		<div class="card">
			<table>
				<thead>
					<tr>
						<th>Opponent</th>
						<th>Result</th>
						<th>Score W/L/D</th>
					</tr>
				</thead>
				<tbody>
					{#each data.recentMatches as match}
						<tr>
							<td>{match.opponentName}</td>
							<td>
								<span class={match.result}>
									{match.result === 'win' ? '✅ Win' : match.result === 'loss' ? '❌ Loss' : '➖ Draw'}
								</span>
							</td>
							<td class="score">{match.winsA}-{match.winsB}-{match.drawCount}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div class="card empty">
			<p>No matches played yet.</p>
		</div>
	{/if}
</div>

<style>
	.profile-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 1.5rem;
	}

	h2 {
		margin-bottom: 1rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 700;
	}

	.stat-label {
		font-size: 0.8rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
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

	.score {
		font-family: var(--font-mono);
		font-size: 0.9rem;
	}

	.empty {
		text-align: center;
		padding: 2rem;
		color: var(--text-muted);
	}
</style>
