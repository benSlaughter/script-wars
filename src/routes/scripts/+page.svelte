<script lang="ts">
	let { data } = $props();
</script>

<h1>📝 My Scripts</h1>

{#if !data.loggedIn}
	<div class="card empty">
		<p>Log in to create and manage your battle scripts.</p>
		<a href="/login" class="btn btn-primary">Log In</a>
	</div>
{:else}
	<div class="games-list">
		{#each data.games as game}
			{@const scripts = data.gameScripts[game.id] ?? []}
			{@const activeScript = scripts.find((s) => s.isActiveEntry)}
			<div class="card game-section">
				<div class="game-header">
					<div class="game-info">
						<span class="game-icon">{game.icon}</span>
						<div>
							<h2>{game.name}</h2>
							<p class="game-desc">{game.description}</p>
						</div>
					</div>
					<div class="game-actions">
						<a href="/games/{game.id}/scripts/new" class="btn btn-primary btn-sm">+ New Script</a>
						{#if scripts.length > 0}
							<a href="/games/{game.id}/scripts" class="btn btn-ghost btn-sm">View All</a>
						{/if}
					</div>
				</div>

				{#if scripts.length === 0}
					<p class="no-scripts">No scripts yet — write your first bot!</p>
				{:else}
					<div class="script-summary">
						<span class="script-count">{scripts.length} script{scripts.length !== 1 ? 's' : ''}</span>
						{#if activeScript}
							<span class="active-entry">⚔️ Active: <strong>{activeScript.name}</strong></span>
						{/if}
					</div>
					<div class="script-chips">
						{#each scripts as script}
							<a
								href="/games/{game.id}/scripts/{script.id}/edit"
								class="script-chip"
								class:active={script.isActiveEntry}
							>
								{script.name}
								{#if script.isActiveEntry}
									<span class="chip-badge">⚔️</span>
								{/if}
							</a>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}

<style>
	h1 {
		margin-bottom: 1.5rem;
	}

	.empty {
		text-align: center;
		padding: 3rem;
		color: var(--text-muted);
	}

	.empty p {
		margin-bottom: 1rem;
	}

	.games-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.game-section {
		padding: 1.5rem;
	}

	.game-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.game-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.game-icon {
		font-size: 2rem;
	}

	.game-info h2 {
		font-size: 1.2rem;
		margin-bottom: 0.15rem;
	}

	.game-desc {
		color: var(--text-muted);
		font-size: 0.85rem;
	}

	.game-actions {
		display: flex;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.no-scripts {
		color: var(--text-muted);
		font-style: italic;
		font-size: 0.9rem;
	}

	.script-summary {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		font-size: 0.85rem;
		margin-bottom: 0.75rem;
	}

	.script-count {
		color: var(--text-muted);
	}

	.active-entry {
		color: var(--accent);
	}

	.script-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.script-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.4rem 0.8rem;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 0.4rem;
		font-size: 0.85rem;
		color: var(--text);
		transition: border-color 0.15s;
	}

	.script-chip:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.script-chip.active {
		border-color: var(--accent);
	}

	.chip-badge {
		font-size: 0.7rem;
	}

	.btn-sm {
		padding: 0.35rem 0.7rem;
		font-size: 0.8rem;
	}

	@media (max-width: 600px) {
		.game-header {
			flex-direction: column;
		}

		.game-actions {
			align-self: stretch;
		}

		.game-actions .btn {
			flex: 1;
			text-align: center;
		}
	}
</style>
