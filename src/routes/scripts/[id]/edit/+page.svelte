<script lang="ts">
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();

	let name = $state(data.script.name);
	let code = $state(data.script.code);
	let error = $state('');
	let saving = $state(false);

	async function handleSave() {
		error = '';
		saving = true;

		const res = await fetch('/api/scripts', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: data.script.id, name, code })
		});

		if (!res.ok) {
			const d = await res.json().catch(() => ({ message: 'Save failed' }));
			error = d.message ?? 'Save failed';
			saving = false;
			return;
		}

		goto('/scripts');
	}
</script>

<div class="editor-page">
	<div class="editor-header">
		<div class="header-left">
			<a href="/scripts" class="btn btn-ghost">← Back</a>
			<input type="text" class="name-input" bind:value={name} placeholder="Script name..." />
			{#if data.script.isActiveEntry}
				<span class="badge">⚔️ Active</span>
			{/if}
		</div>
		<button class="btn btn-primary" onclick={handleSave} disabled={saving}>
			{saving ? 'Saving...' : '💾 Save Changes'}
		</button>
	</div>

	{#if error}
		<p class="error">{error}</p>
	{/if}

	<div class="editor-layout">
		<div class="editor-panel">
			<CodeEditor value={code} onchange={(v) => (code = v)} />
		</div>
		<div class="docs-panel card">
			<h3>🎮 Game API</h3>
			<div class="doc-section">
				<h4>Your script must return:</h4>
				<code>"rock"</code>, <code>"paper"</code>, or <code>"scissors"</code>
			</div>
			<div class="doc-section">
				<h4>Available variables:</h4>
				<dl>
					<dt><code>opponent_history</code></dt>
					<dd>Table of opponent's previous moves</dd>
					<dt><code>my_history</code></dt>
					<dd>Table of your previous moves</dd>
					<dt><code>round_number</code></dt>
					<dd>Current round (1-based)</dd>
				</dl>
			</div>
			<div class="doc-section">
				<h4>Available functions:</h4>
				<dl>
					<dt><code>math.random(n)</code></dt>
					<dd>Random integer 1 to n</dd>
					<dt><code>#table</code></dt>
					<dd>Length of a table</dd>
					<dt><code>table[i]</code></dt>
					<dd>Get item at index i</dd>
				</dl>
			</div>
		</div>
	</div>
</div>

<style>
	.editor-page {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 10rem);
	}

	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		gap: 1rem;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;
	}

	.name-input {
		flex: 1;
		max-width: 300px;
		padding: 0.5rem 0.75rem;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 0.4rem;
		color: var(--text);
		font-size: 1rem;
		font-weight: 600;
	}

	.name-input:focus {
		outline: none;
		border-color: var(--accent);
	}

	.badge {
		font-size: 0.75rem;
		padding: 0.2rem 0.5rem;
		border-radius: 0.3rem;
		font-weight: 600;
		background: var(--accent);
		color: white;
	}

	.editor-layout {
		display: grid;
		grid-template-columns: 1fr 280px;
		gap: 1rem;
		flex: 1;
		min-height: 0;
	}

	.editor-panel {
		min-height: 0;
	}

	.docs-panel {
		overflow-y: auto;
		font-size: 0.85rem;
		padding: 1rem;
	}

	.docs-panel h3 {
		margin-bottom: 1rem;
		font-size: 1rem;
	}

	.docs-panel h4 {
		color: var(--text-muted);
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.4rem;
	}

	.doc-section {
		margin-bottom: 1.25rem;
	}

	.docs-panel dl {
		margin: 0;
	}

	.docs-panel dt {
		margin-top: 0.4rem;
	}

	.docs-panel dd {
		color: var(--text-muted);
		margin-left: 0;
		margin-bottom: 0.3rem;
		font-size: 0.8rem;
	}

	.docs-panel code {
		color: var(--accent);
		font-size: 0.8rem;
	}

	@media (max-width: 768px) {
		.editor-layout {
			grid-template-columns: 1fr;
		}

		.docs-panel {
			display: none;
		}
	}
</style>
