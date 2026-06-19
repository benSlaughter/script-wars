import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db.js';
import * as schema from './schema.js';

const secret = process.env.BETTER_AUTH_SECRET ?? 'dev-only-change-me-in-production';

// Enforce secret in production — deferred check so build doesn't crash
if (typeof globalThis.__script_wars_auth_checked === 'undefined') {
	globalThis.__script_wars_auth_checked = true;
	// At build time, HOST isn't set. At runtime with adapter-node, it is.
	if (process.env.NODE_ENV === 'production' && process.env.HOST && !process.env.BETTER_AUTH_SECRET) {
		throw new Error(
			'FATAL: BETTER_AUTH_SECRET must be set in production. ' +
			'Generate one with: openssl rand -base64 32'
		);
	}
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
		minPasswordLength: 8
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60 // 5 minutes
		}
	}
});
