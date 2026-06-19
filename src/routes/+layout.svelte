<script lang="ts">
	import '../app.css';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let { children } = $props();

	const session = authClient.useSession();
	let dropdownOpen = $state(false);

	async function handleLogout() {
		dropdownOpen = false;
		await authClient.signOut();
		goto('/');
	}

	function toggleDropdown() {
		dropdownOpen = !dropdownOpen;
	}

	function closeDropdown() {
		dropdownOpen = false;
	}
</script>

<svelte:window onclick={() => (dropdownOpen = false)} />

<div class="app">
	<header>
		<nav class="container">
			<a href="/" class="logo">⚔️ Script Wars</a>
			<div class="nav-links">
				<a href="/leaderboard">🏆 Leaderboard</a>
				{#if $session.data}
					<div class="user-dropdown">
						<button
							class="dropdown-trigger"
							onclick={(e) => { e.stopPropagation(); toggleDropdown(); }}
						>
							{$session.data.user.name} ▾
						</button>
						{#if dropdownOpen}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div class="dropdown-menu" onclick={(e) => e.stopPropagation()}>
								<a href="/scripts" class="dropdown-item" onclick={closeDropdown}>📝 My Scripts</a>
								<hr />
								<button class="dropdown-item logout" onclick={handleLogout}>🚪 Log out</button>
							</div>
						{/if}
					</div>
				{:else}
					<a href="/login" class="btn btn-ghost">Log in</a>
				{/if}
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

	.user-dropdown {
		position: relative;
	}

	.dropdown-trigger {
		background: none;
		border: 1px solid var(--border);
		color: var(--accent);
		font-weight: 600;
		padding: 0.4rem 0.8rem;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
	}

	.dropdown-trigger:hover {
		background: var(--surface);
		border-color: var(--accent);
	}

	.dropdown-menu {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 0.4rem;
		min-width: 160px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
		z-index: 100;
	}

	.dropdown-menu hr {
		border: none;
		border-top: 1px solid var(--border);
		margin: 0.3rem 0;
	}

	.dropdown-item {
		display: block;
		width: 100%;
		padding: 0.5rem 0.75rem;
		border-radius: 4px;
		font-size: 0.9rem;
		text-align: left;
		color: var(--text);
		background: none;
		border: none;
		cursor: pointer;
	}

	.dropdown-item:hover {
		background: var(--bg);
	}

	.dropdown-item.logout {
		color: var(--text-muted);
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
