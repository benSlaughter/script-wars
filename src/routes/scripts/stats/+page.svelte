<script lang="ts">
	let { data } = $props();
</script>

<div class="stats-page">
	<div class="stats-header">
		<h1>📈 My Script Stats</h1>
		<a href="/scripts" class="btn btn-ghost">← Back to Scripts</a>
	</div>

	{#if data.scriptStats.length === 0}
		<div class="card empty">
			<p>No scripts yet. Create one and enter the arena!</p>
		</div>
	{:else}
		{#each data.scriptStats as script}
			<div class="card script-stats" class:active={script.isActive}>
				<div class="script-stats-header">
					<h2>
						{script.name}
						{#if script.isActive}
							<span class="badge">⚔️ Active</span>
						{/if}
					</h2>
					<div class="overview">
						<span class="win">{script.wins}W</span>
						<span class="loss">{script.losses}L</span>
						<span class="draw">{script.draws}D</span>
					</div>
				</div>

				{#if script.opponents.length > 0}
					<table>
						<thead>
							<tr>
								<th>Opponent</th>
								<th colspan="3">Score W/L/D</th>
								<th>Result</th>
							</tr>
						</thead>
						<tbody>
							{#each script.opponents as opp}
								<tr>
									<td>{opp.name}</td>
									<td class="win">{opp.wins}</td>
									<td class="loss">{opp.losses}</td>
									<td class="draw">{opp.draws}</td>
									<td>
										{#if opp.wins > opp.losses}
											<span class="win">✅</span>
										{:else if opp.losses > opp.wins}
											<span class="loss">❌</span>
										{:else}
											<span class="draw">➖</span>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{:else}
					<p class="no-matches">No matches played yet</p>
				{/if}
			</div>
		{/each}
	{/if}
</div>

<style>
	.stats-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	h1 {
		margin: 0;
	}

	.script-stats {
		margin-bottom: 1.5rem;
	}

	.script-stats.active {
		border-color: var(--accent);
	}

	.script-stats-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.script-stats-header h2 {
		font-size: 1.2rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.badge {
		font-size: 0.7rem;
		padding: 0.15rem 0.4rem;
		border-radius: 0.3rem;
		background: var(--accent);
		color: white;
		font-weight: 600;
	}

	.overview {
		display: flex;
		gap: 1rem;
		font-weight: 700;
		font-size: 1.1rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th {
		text-align: left;
		padding: 0.5rem;
		border-bottom: 1px solid var(--border);
		color: var(--text-muted);
		font-size: 0.8rem;
		text-transform: uppercase;
	}

	td {
		padding: 0.5rem;
		border-bottom: 1px solid var(--border);
		font-size: 0.9rem;
	}

	tr:last-child td {
		border-bottom: none;
	}

	.no-matches {
		color: var(--text-muted);
		font-size: 0.9rem;
	}

	.empty {
		text-align: center;
		padding: 2rem;
		color: var(--text-muted);
	}
</style>
