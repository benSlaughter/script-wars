<script lang="ts">
	import { resolve } from '$app/paths';

	let { data } = $props();
</script>

<h1>📖 {data.gameName} Guide</h1>
<p>Game-specific documentation coming soon.</p>
<p><a href={resolve(`/docs`)}>View the full Lua scripting guide →</a></p>

{#if data.docsSections.length > 0}
	<div class="docs-sections">
		{#each data.docsSections as section (section.title)}
			<section class="card doc-section">
				<h2>{section.title}</h2>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<div class="doc-content">{@html section.content}</div>
			</section>
		{/each}
	</div>
{/if}

<style>
	.docs-sections {
		margin-top: 1.5rem;
		display: grid;
		gap: 1rem;
	}

	.doc-section {
		padding: 1rem;
	}

	.doc-content :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin-top: 0.75rem;
	}

	.doc-content :global(td) {
		padding: 0.5rem;
		border-bottom: 1px solid var(--border);
	}

	.doc-content :global(code) {
		background: var(--bg);
		padding: 0.15rem 0.35rem;
		border-radius: 0.25rem;
	}
</style>
