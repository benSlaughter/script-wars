import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db.js';
import * as schema from './schema.js';
import { Resend } from 'resend';

const secret = process.env.BETTER_AUTH_SECRET ?? 'dev-only-change-me-in-production';

// Enforce secret in production — deferred check so build doesn't crash
if (typeof globalThis.__script_wars_auth_checked === 'undefined') {
	globalThis.__script_wars_auth_checked = true;
	if (process.env.NODE_ENV === 'production' && process.env.HOST && !process.env.BETTER_AUTH_SECRET) {
		throw new Error(
			'FATAL: BETTER_AUTH_SECRET must be set in production. ' +
			'Generate one with: openssl rand -base64 32'
		);
	}
}

// Lazy-initialize Resend client on first use
let _resend: Resend | null | undefined = undefined;
async function getResend(): Promise<Resend | null> {
	if (_resend === undefined) {
		// Import env dynamically to access Vite-loaded .env vars
		const { env } = await import('$env/dynamic/private');
		const key = env.RESEND_API_KEY;
		_resend = key ? new Resend(key) : null;
	}
	return _resend;
}

async function getEmailFrom(): Promise<string> {
	const { env } = await import('$env/dynamic/private');
	return env.EMAIL_FROM ?? 'Script Wars <noreply@scriptwars.dev>';
}

export const auth = betterAuth({
	secret,
	database: drizzleAdapter(db, {
		provider: 'sqlite',
		schema: {
			user: schema.users,
			session: schema.sessions,
			account: schema.accounts,
			verification: schema.verifications
		}
	}),
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
		requireEmailVerification: true
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			const resend = await getResend();
			if (resend) {
				await resend.emails.send({
					from: await getEmailFrom(),
					to: user.email,
					subject: 'Verify your Script Wars account',
					html: `
						<h2>Welcome to Script Wars! ⚔️</h2>
						<p>Click the link below to verify your email and start battling:</p>
						<p><a href="${url}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:6px;font-weight:bold;">Verify Email</a></p>
						<p style="color:#888;font-size:0.85em;">If you didn't create this account, you can safely ignore this email.</p>
					`
				});
			} else {
				console.log(`[DEV] Verification email for ${user.email}: ${url}`);
			}
		}
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60 // 5 minutes
		}
	}
});

/**
 * Verify a Cloudflare Turnstile token server-side.
 * Returns true if valid, false otherwise.
 */
export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
	const { env } = await import('$env/dynamic/private');
	const secretKey = env.TURNSTILE_SECRET_KEY;
	if (!secretKey) return true; // Skip if not configured

	const formData = new URLSearchParams();
	formData.append('secret', secretKey);
	formData.append('response', token);
	if (ip) formData.append('remoteip', ip);

	const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		body: formData
	});

	const data = await res.json();
	return data.success === true;
}
