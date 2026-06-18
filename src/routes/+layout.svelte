<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="app">
	<header>
		<nav class="container">
			<a href="/" class="logo">⚔️ Script Wars</a>
			<div class="nav-links">
				<a href="/leaderboard">🏆 Leaderboard</a>
				<a href="/scripts">📝 My Scripts</a>
				<a href="/login" class="btn btn-ghost">Log in</a>
			</div>
		</nav>
	</header>

	<main class="container">
		{@render children()}
	</main>

	<footer>
		<div class="container">
			<p>Script Wars — write bots, win glory</p>
		</div>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	header {
		border-bottom: 1px solid var(--border);
		padding: 1rem 0;
	}

	nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.logo {
		font-size: 1.4rem;
		font-weight: 700;
		color: var(--text);
	}

	.logo:hover {
		color: var(--accent);
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	main {
		flex: 1;
		padding-top: 2rem;
		padding-bottom: 3rem;
	}

	footer {
		border-top: 1px solid var(--border);
		padding: 1.5rem 0;
		text-align: center;
		color: var(--text-muted);
		font-size: 0.85rem;
	}
</style>
