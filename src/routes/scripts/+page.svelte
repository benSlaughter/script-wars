<script lang="ts">
	import { authClient } from '$lib/auth-client';

	const session = authClient.useSession();
</script>

<h1>📝 My Scripts</h1>

{#if !$session.data}
	<div class="card empty">
		<p>Log in to create and manage your battle scripts.</p>
		<a href="/login" class="btn btn-primary">Log In</a>
	</div>
{:else}
	<div class="toolbar">
		<a href="/scripts/new" class="btn btn-primary">+ New Script</a>
	</div>

	<div class="card empty">
		<p>You haven't written any scripts yet. Time to enter the arena!</p>
	</div>
{/if}

<style>
	h1 {
		margin-bottom: 1.5rem;
	}

	.toolbar {
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
</style>
