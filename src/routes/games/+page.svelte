<script lang="ts">
	let { data } = $props();
</script>

<h1>🎮 Games</h1>
<p class="intro">Choose a game and write bots to compete in the arena.</p>

<div class="game-grid">
	{#each data.games as game}
		<a href="/games/{game.id}" class="game-card card">
			<span class="game-card-icon">{game.icon}</span>
			<h2>{game.name}</h2>
			<p>{game.description}</p>
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
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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

	.game-card-icon {
		font-size: 3rem;
		margin-bottom: 0.75rem;
	}

	.game-card h2 {
		font-size: 1.2rem;
		margin-bottom: 0.5rem;
	}

	.game-card p {
		color: var(--text-muted);
		font-size: 0.9rem;
	}
</style>
