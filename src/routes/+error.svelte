<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="error-page">
	<div class="error-content">
		<span class="error-code">{page.status}</span>
		<h1>
			{#if page.status === 404}
				Lost in the arena
			{:else if page.status === 401}
				Access denied
			{:else if page.status === 429}
				Slow down, warrior
			{:else}
				Something went wrong
			{/if}
		</h1>
		<p class="error-message">
			{#if page.error?.message}
				{page.error.message}
			{:else if page.status === 404}
				The page you're looking for doesn't exist.
			{:else}
				An unexpected error occurred.
			{/if}
		</p>
		<a href="/" class="btn btn-primary">← Back to Home</a>
	</div>
</div>

<style>
	.error-page {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 50vh;
		text-align: center;
	}

	.error-code {
		font-size: 5rem;
		font-weight: 800;
		color: var(--accent);
		opacity: 0.3;
		display: block;
		line-height: 1;
	}

	h1 {
		font-size: 1.8rem;
		margin: 0.5rem 0;
	}

	.error-message {
		color: var(--text-muted);
		margin-bottom: 1.5rem;
		max-width: 400px;
	}
</style>
