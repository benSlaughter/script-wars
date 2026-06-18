<script lang="ts">
	let { data } = $props();
</script>

<h1>🏆 Leaderboard</h1>

{#if data.entries.length === 0}
	<div class="card empty">
		<p>No battles yet — be the first to enter the arena!</p>
		<a href="/register" class="btn btn-primary">Create Account</a>
	</div>
{:else}
	<div class="card">
		<table>
			<thead>
				<tr>
					<th class="rank">#</th>
					<th>Player</th>
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
						<td class="player">{entry.name}</td>
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
	h1 {
		margin-bottom: 1.5rem;
	}

	.empty {
		text-align: center;
		padding: 3rem;
	}

	.empty p {
		margin-bottom: 1rem;
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
</style>
