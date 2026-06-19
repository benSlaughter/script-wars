<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { validateDisplayName } from '$lib/validation';
	import { onMount } from 'svelte';

	let { data } = $props();

	const turnstileSiteKey = data.turnstileSiteKey ?? '';

	let email = $state('');
	let password = $state('');
	let name = $state('');
	let error = $state('');
	let loading = $state(false);
	let nameError = $derived(name.length > 0 ? validateDisplayName(name).error ?? '' : '');
	let turnstileToken = $state('');
	let turnstileContainer: HTMLDivElement;
	const hasTurnstile = !!turnstileSiteKey;

	onMount(() => {
		if (!hasTurnstile) return;

		// Load Turnstile script
		const script = document.createElement('script');
		script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
		script.async = true;
		script.defer = true;
		script.onload = () => {
			(window as any).turnstile.render(turnstileContainer, {
				sitekey: turnstileSiteKey,
				callback: (token: string) => { turnstileToken = token; },
				theme: 'dark'
			});
		};
		document.head.appendChild(script);

		return () => {
			script.remove();
		};
	});

	async function handleRegister(e: SubmitEvent) {
		e.preventDefault();
		error = '';

		const nameCheck = validateDisplayName(name);
		if (!nameCheck.valid) {
			error = nameCheck.error!;
			return;
		}

		if (hasTurnstile && !turnstileToken) {
			error = 'Please complete the verification challenge';
			return;
		}

		loading = true;

		const fetchOptions: Record<string, string> = {};
		if (hasTurnstile && turnstileToken) {
			fetchOptions['x-captcha-response'] = turnstileToken;
		}

		const { error: err } = await authClient.signUp.email({
			email,
			password,
			name: name.trim(),
			fetchOptions: {
				headers: fetchOptions
			}
		});

		if (err) {
			error = err.message ?? 'Registration failed';
			loading = false;
			// Reset turnstile on failure
			if (hasTurnstile && (window as any).turnstile) {
				(window as any).turnstile.reset();
				turnstileToken = '';
			}
		} else {
			goto('/games');
		}
	}
</script>

<div class="auth-page">
	<div class="card auth-card">
		<h1>Create Account</h1>
		<p class="subtitle">Join the arena</p>

		<form onsubmit={handleRegister}>
			<div class="form-group">
				<label for="name">Display Name</label>
				<input id="name" type="text" bind:value={name} required autocomplete="username" minlength="2" maxlength="20" />
				{#if nameError}
					<p class="field-error">{nameError}</p>
				{/if}
			</div>
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
					minlength="8"
					autocomplete="new-password"
				/>
			</div>

			{#if hasTurnstile}
				<div class="turnstile-wrapper" bind:this={turnstileContainer}></div>
			{/if}

			{#if error}
				<p class="error">{error}</p>
			{/if}

			<button type="submit" class="btn btn-primary full-width" disabled={loading}>
				{loading ? 'Creating...' : 'Create Account'}
			</button>
		</form>

		<p class="switch-link">Already have an account? <a href="/login">Log in</a></p>
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

	.field-error {
		color: var(--danger, #f44336);
		font-size: 0.8rem;
		margin-top: 0.25rem;
	}

	.turnstile-wrapper {
		display: flex;
		justify-content: center;
		margin: 0.75rem 0;
	}
</style>
