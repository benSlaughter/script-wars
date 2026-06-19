<script lang="ts">
	let { children, data } = $props();
</script>

<div class="game-header">
	<span class="game-icon">{data.gameIcon}</span>
	<div>
		<h2 class="game-title">{data.gameName}</h2>
		<nav class="game-nav">
			<a href="/games/{data.gameId}/leaderboard">🏆 Leaderboard</a>
			<a href="/games/{data.gameId}/friendly">⚔️ Friendly</a>
			<a href="/games/{data.gameId}/scripts">📝 Scripts</a>
			<a href="/games/{data.gameId}/docs">📖 Docs</a>
		</nav>
	</div>
</div>

{@render children()}

<style>
	.game-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border);
	}

	.game-icon {
		font-size: 2.5rem;
	}

	.game-title {
		font-size: 1.4rem;
		margin-bottom: 0.25rem;
	}

	.game-nav {
		display: flex;
		gap: 1.25rem;
		font-size: 0.9rem;
	}

	.game-nav a {
		color: var(--text-muted);
	}

	.game-nav a:hover {
		color: var(--accent);
	}
</style>
