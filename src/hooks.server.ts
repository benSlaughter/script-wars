import { auth, verifyTurnstile } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { startScheduler } from '$lib/server/scheduler';
import { checkRateLimit, RATE_LIMITS } from '$lib/server/rate-limit';
import { json, type Handle } from '@sveltejs/kit';
import { validateDisplayName } from '$lib/validation';

// Start hourly tournament scheduler on server boot
startScheduler();

export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname;

	// Rate limit auth endpoints by IP
	if (path.startsWith('/api/auth/sign-up') || path.startsWith('/api/auth/sign-in')) {
		const ip = event.getClientAddress();
		const { allowed } = checkRateLimit(`auth:${ip}`, RATE_LIMITS.auth);
		if (!allowed) {
			return json({ message: 'Too many attempts. Try again later.' }, { status: 429 });
		}
	}

	// Validate signup requests: name validation + Turnstile
	if (path === '/api/auth/sign-up/email' && event.request.method === 'POST') {
		const cloned = event.request.clone();
		try {
			const body = await cloned.json();

			// Validate display name
			if (body.name) {
				const nameCheck = validateDisplayName(body.name);
				if (!nameCheck.valid) {
					return json({ message: nameCheck.error }, { status: 400 });
				}
			}

			// Verify Turnstile token
			const captchaToken = event.request.headers.get('x-captcha-response');
			if (process.env.TURNSTILE_SECRET_KEY) {
				if (!captchaToken) {
					return json({ message: 'CAPTCHA verification required' }, { status: 400 });
				}
				const valid = await verifyTurnstile(captchaToken, event.getClientAddress());
				if (!valid) {
					return json({ message: 'CAPTCHA verification failed' }, { status: 403 });
				}
			}
		} catch {
			// If body parsing fails, let Better Auth handle it
		}
	}

	return svelteKitHandler({ event, resolve, auth });
};
