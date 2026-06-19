<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { page } from '$app/state';

	interface Script {
		id: string;
		name: string;
		code: string;
		isActiveEntry: boolean;
		createdAt: string;
		updatedAt: string;
	}

	const session = authClient.useSession();
	let scripts = $state<Script[]>([]);
	let loading = $state(true);

	const gameId = $derived(page.params.gameId);

	$effect(() => {
		const gid = gameId;
		if ($session.data && gid) {
			loading = true;
			loadScripts(gid);
		} else if ($session.data === null && !$session.isPending) {
			loading = false;
		}
	});

	async function loadScripts(gid: string) {
		const res = await fetch(`/api/games/${gid}/scripts`);
		if (res.ok) {
			scripts = await res.json();
		}
		loading = false;
	}

	async function deleteScript(id: string) {
		if (!confirm('Delete this script?')) return;
		const res = await fetch(`/api/games/${gameId}/scripts`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id })
		});
		if (res.ok) {
			scripts = scripts.filter((s) => s.id !== id);
		}
	}

	async function activateScript(id: string) {
		const res = await fetch(`/api/games/${gameId}/scripts/activate`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id })
		});
		if (res.ok) {
			scripts = scripts.map((s) => ({ ...s, isActiveEntry: s.id === id }));
		}
	}
</script>

<h1>📝 My Scripts</h1>

{#if !$session.data}
	<div class="card empty">
		<p>Log in to create and manage your battle scripts.</p>
		<a href="/login" class="btn btn-primary">Log In</a>
	</div>
{:else if loading}
	<p class="loading">Loading scripts...</p>
{:else}
	<div class="toolbar">
		<a href="/games/{gameId}/scripts/new" class="btn btn-primary">+ New Script</a>
		<a href="/games/{gameId}/scripts/stats" class="btn btn-ghost">📈 Stats</a>
	</div>

	{#if scripts.length === 0}
		<div class="card empty">
			<p>You haven't written any scripts for this game yet. Time to enter the arena!</p>
			<a href="/games/{gameId}/scripts/new" class="btn btn-primary">Write Your First Bot</a>
		</div>
	{:else}
		<div class="script-list">
			{#each scripts as script}
				<div class="card script-card" class:active={script.isActiveEntry}>
					<div class="script-header">
						<div class="script-info">
							<h3>{script.name}</h3>
							{#if script.isActiveEntry}
								<span class="badge active-badge">⚔️ Active Entry</span>
							{/if}
						</div>
						<div class="script-actions">
							{#if !script.isActiveEntry}
								<button
									class="btn btn-ghost btn-sm"
									onclick={() => activateScript(script.id)}
								>
									Set Active
								</button>
							{/if}
							<a href="/games/{gameId}/scripts/{script.id}/edit" class="btn btn-ghost btn-sm">Edit</a>
							<button
								class="btn btn-ghost btn-sm btn-danger"
								onclick={() => deleteScript(script.id)}
							>
								Delete
							</button>
						</div>
					</div>
					<pre class="script-preview"><code>{script.code.slice(0, 200)}{script.code.length > 200 ? '...' : ''}</code></pre>
				</div>
			{/each}
		</div>
	{/if}
{/if}

<style>
	h1 {
		margin-bottom: 1.5rem;
	}

	.toolbar {
		margin-bottom: 1.5rem;
	}

	.loading {
		color: var(--text-muted);
	}

	.empty {
		text-align: center;
		padding: 3rem;
		color: var(--text-muted);
	}

	.empty p {
		margin-bottom: 1rem;
	}

	.script-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.script-card {
		transition: border-color 0.15s;
	}

	.script-card.active {
		border-color: var(--accent);
	}

	.script-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.75rem;
		gap: 1rem;
	}

	.script-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.script-info h3 {
		font-size: 1.1rem;
	}

	.script-actions {
		display: flex;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.badge {
		font-size: 0.75rem;
		padding: 0.2rem 0.5rem;
		border-radius: 0.3rem;
		font-weight: 600;
	}

	.active-badge {
		background: var(--accent);
		color: white;
	}

	.btn-sm {
		padding: 0.35rem 0.7rem;
		font-size: 0.8rem;
	}

	:global(.btn-danger) {
		color: var(--red) !important;
		border-color: var(--red) !important;
	}

	:global(.btn-danger:hover) {
		background: var(--red) !important;
		color: white !important;
	}

	.script-preview {
		background: var(--bg);
		padding: 0.75rem;
		border-radius: 0.4rem;
		font-size: 0.8rem;
		overflow-x: auto;
		color: var(--text-muted);
		max-height: 80px;
		overflow-y: hidden;
	}
</style>
