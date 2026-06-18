<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		loading = true;

		const { error: err } = await authClient.signIn.email({
			email,
			password
		});

		if (err) {
			error = err.message ?? 'Login failed';
			loading = false;
		} else {
			goto('/scripts');
		}
	}
</script>

<div class="auth-page">
	<div class="card auth-card">
		<h1>Welcome Back</h1>
		<p class="subtitle">Log in to the arena</p>

		<form onsubmit={handleLogin}>
			<div class="form-group">
				<label for="email">Email</label>
				<input id="email" type="email" bind:value={email} required autocomplete="email" />
			</div>
			<div class="form-group">
				<label for="password">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					required
					autocomplete="current-password"
				/>
			</div>

			{#if error}
				<p class="error">{error}</p>
			{/if}

			<button type="submit" class="btn btn-primary full-width" disabled={loading}>
				{loading ? 'Logging in...' : 'Log In'}
			</button>
		</form>

		<p class="switch-link">No account yet? <a href="/register">Create one</a></p>
	</div>
</div>

<style>
	.auth-page {
		display: flex;
		justify-content: center;
		padding-top: 2rem;
	}

	.auth-card {
		width: 100%;
		max-width: 400px;
	}

	h1 {
		font-size: 1.5rem;
		margin-bottom: 0.25rem;
	}

	.subtitle {
		color: var(--text-muted);
		margin-bottom: 1.5rem;
	}

	.full-width {
		width: 100%;
		justify-content: center;
		margin-top: 0.5rem;
	}

	.switch-link {
		text-align: center;
		margin-top: 1.25rem;
		font-size: 0.9rem;
		color: var(--text-muted);
	}
</style>
