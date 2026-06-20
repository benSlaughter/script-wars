import { validateDisplayName } from '$lib/validation';
import { checkRateLimit, RATE_LIMITS } from '$lib/server/rate-limit';
import type { Handle } from '@sveltejs/kit';

// Lazy-load heavy modules to avoid circular dependency deadlock:
// main chunk has TLA (await server.init()) which dynamically imports hooks.server,
// but auth/db transitively import from main chunk → deadlock if statically imported here.
let _auth: Awaited<typeof import('$lib/server/auth')> | null = null;
async function getAuthModule() {
	if (!_auth) _auth = await import('$lib/server/auth');
	return _auth;
}

let _scheduler: Awaited<typeof import('$lib/server/scheduler')> | null = null;
async function getScheduler() {
	if (!_scheduler) _scheduler = await import('$lib/server/scheduler');
	return _scheduler;
}

let _svelteKitHandler: Awaited<typeof import('better-auth/svelte-kit')> | null = null;
async function getSvelteKitHandler() {
	if (!_svelteKitHandler) _svelteKitHandler = await import('better-auth/svelte-kit');
	return _svelteKitHandler;
}

function jsonResponse(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'content-type': 'application/json' }
	});
}

let schedulerStarted = false;

export const handle: Handle = async ({ event, resolve }) => {
	// Start scheduler on first request (lazy to avoid import deadlock)
	if (!schedulerStarted) {
		schedulerStarted = true;
		const { startScheduler } = await getScheduler();
		startScheduler();
	}

	const path = event.url.pathname;

	// Rate limit auth endpoints by IP
	if (path.startsWith('/api/auth/sign-up') || path.startsWith('/api/auth/sign-in')) {
		const ip = event.getClientAddress();
		const { allowed } = checkRateLimit(`auth:${ip}`, RATE_LIMITS.auth);
		if (!allowed) {
			return jsonResponse({ message: 'Too many attempts. Try again later.' }, 429);
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
					return jsonResponse({ message: nameCheck.error }, 400);
				}
			}

			// Verify Turnstile token
			const captchaToken = event.request.headers.get('x-captcha-response');
			if (process.env.TURNSTILE_SECRET_KEY) {
				if (!captchaToken) {
					return jsonResponse({ message: 'CAPTCHA verification required' }, 400);
				}
				const { verifyTurnstile } = await getAuthModule();
				const valid = await verifyTurnstile(captchaToken, event.getClientAddress());
				if (!valid) {
					return jsonResponse({ message: 'CAPTCHA verification failed' }, 403);
				}
			}
		} catch {
			// If body parsing fails, let Better Auth handle it
		}
	}

	const { auth } = await getAuthModule();
	const { svelteKitHandler } = await getSvelteKitHandler();
	return svelteKitHandler({ event, resolve, auth, building: false });
};
