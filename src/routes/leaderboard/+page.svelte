<script lang="ts">
	let { data } = $props();
</script>

<h1>🏆 Leaderboards</h1>
<p class="intro">Choose a game to view its leaderboard.</p>

<div class="game-grid">
	{#each data.games as game}
		<a href="/games/{game.id}/leaderboard" class="game-card card">
			<span class="game-icon">{game.icon}</span>
			<h2>{game.name}</h2>
			<span class="view-link">View Leaderboard →</span>
		</a>
	{/each}
</div>

<style>
	.intro {
		color: var(--text-muted);
		margin-bottom: 2rem;
	}

	.game-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.game-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 2rem;
		transition: border-color 0.15s, transform 0.15s;
	}

	.game-card:hover {
		border-color: var(--accent);
		transform: translateY(-2px);
	}

	.game-icon {
		font-size: 2.5rem;
		margin-bottom: 0.75rem;
	}

	.game-card h2 {
		font-size: 1.2rem;
		margin-bottom: 0.5rem;
	}

	.view-link {
		color: var(--accent);
		font-size: 0.85rem;
	}
</style>
