<script lang="ts">
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	const DEFAULT_CODE = `-- Your battle script!
-- Return "rock", "paper", or "scissors"
-- You have access to: opponent_history, my_history, round_number

local moves = {"rock", "paper", "scissors"}
return moves[math.random(#moves)]
`;

	const gameId = $derived(page.params.gameId);

	let name = $state('My Bot');
	let code = $state(DEFAULT_CODE);
	let error = $state('');
	let saving = $state(false);

	async function handleSave() {
		error = '';
		saving = true;

		const res = await fetch(`/api/games/${gameId}/scripts`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, code })
		});

		if (!res.ok) {
			const data = await res.json().catch(() => ({ message: 'Save failed' }));
			error = data.message ?? 'Save failed';
			saving = false;
			return;
		}

		goto(resolve(`/games/${gameId}/scripts`));
	}

	interface TestResult {
		round: number;
		success: boolean;
		output: string | null;
		error: string | null;
		warning: string | null;
		executionTimeMs: number;
	}

	let testResults = $state<TestResult[]>([]);
	let testing = $state(false);

	async function handleTest() {
		testing = true;
		testResults = [];

		const res = await fetch(`/api/games/${gameId}/scripts/test`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ code })
		});

		if (res.ok) {
			const data = await res.json();
			testResults = data.results;
		} else {
			const data = await res.json().catch(() => ({ message: 'Test failed' }));
			error = data.message ?? 'Test failed';
		}

		testing = false;
	}
</script>

<div class="editor-page">
	<div class="editor-header">
		<div class="header-left">
			<a href={resolve(`/games/${gameId}/scripts`)} class="btn btn-ghost">← Back</a>
			<input type="text" class="name-input" bind:value={name} placeholder="Script name..." />
		</div>
		<div class="header-actions">
			<button class="btn btn-ghost" onclick={handleTest} disabled={testing}>
				{testing ? '⏳ Testing...' : '🧪 Test'}
			</button>
			<button class="btn btn-primary" onclick={handleSave} disabled={saving}>
				{saving ? 'Saving...' : '💾 Save Script'}
			</button>
		</div>
	</div>

	{#if error}
		<p class="error">{error}</p>
	{/if}

	{#if testResults.length > 0}
		<div class="test-results card">
			<h4>🧪 Test Results (vs. opponent who always plays "rock")</h4>
			{#each testResults as r (r.round)}
				<div class="test-round" class:pass={r.success && !r.warning} class:warn={r.success && !!r.warning} class:fail={!r.success}>
					<span class="round-num">R{r.round}</span>
					{#if r.success && !r.warning}
						<span class="move">{r.output}</span>
						<span class="time">{r.executionTimeMs.toFixed(1)}ms</span>
					{:else if r.success && r.warning}
						<span class="move invalid">{r.output ?? '(nil)'}</span>
						<span class="time">{r.executionTimeMs.toFixed(1)}ms</span>
					{:else}
						<span class="err">{r.error}</span>
					{/if}
				</div>
				{#if r.warning}
					<div class="test-warning">⚠️ {r.warning}</div>
				{/if}
				{#if !r.success && r.error}
					<div class="test-error">💥 {r.error}</div>
				{/if}
			{/each}
		</div>
	{/if}

	<div class="editor-layout">
		<div class="editor-panel">
			<CodeEditor value={code} onchange={(v) => (code = v)} placeholder="Write your Lua script here..." />
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
			<div class="doc-section">
				<h4>Example — counter last move:</h4>
				<pre><code>if #opponent_history == 0 then
  return "rock"
end
local last = opponent_history[#opponent_history]
local counter = &#123;
  rock = "paper",
  paper = "scissors",
  scissors = "rock"
&#125;
return counter[last]</code></pre>
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

	.docs-panel pre {
		background: var(--bg);
		padding: 0.5rem;
		border-radius: 0.3rem;
		font-size: 0.75rem;
		overflow-x: auto;
	}

	.docs-panel code {
		color: var(--accent);
		font-size: 0.8rem;
	}

	.docs-panel pre code {
		color: var(--text);
	}

	@media (max-width: 768px) {
		.editor-layout {
			grid-template-columns: 1fr;
		}

		.docs-panel {
			display: none;
		}
	}

	.header-actions {
		display: flex;
		gap: 0.5rem;
	}

	.test-results {
		margin-bottom: 1rem;
		padding: 0.75rem 1rem;
	}

	.test-results h4 {
		font-size: 0.85rem;
		margin-bottom: 0.5rem;
		color: var(--text-muted);
	}

	.test-round {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.3rem 0;
		font-size: 0.85rem;
		font-family: var(--font-mono);
	}

	.test-round.pass .round-num {
		color: var(--green);
	}

	.test-round.fail .round-num {
		color: var(--red);
	}

	.round-num {
		font-weight: 700;
		width: 2rem;
	}

	.move {
		color: var(--accent);
		font-weight: 600;
	}

	.move.invalid {
		color: var(--yellow, #f0ad4e);
		text-decoration: line-through;
	}

	.time {
		color: var(--text-muted);
		font-size: 0.75rem;
	}

	.err {
		color: var(--red);
		font-size: 0.8rem;
	}

	.test-round.warn .round-num {
		color: var(--yellow, #f0ad4e);
	}

	.test-warning {
		padding: 0.3rem 0 0.3rem 2.75rem;
		font-size: 0.8rem;
		color: var(--yellow, #f0ad4e);
	}

	.test-error {
		padding: 0.3rem 0 0.3rem 2.75rem;
		font-size: 0.8rem;
		color: var(--red);
		font-family: var(--font-mono);
		white-space: pre-wrap;
		word-break: break-word;
	}
</style>
