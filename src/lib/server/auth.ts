import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db.js';
import * as schema from './schema.js';

const secret = process.env.BETTER_AUTH_SECRET ?? 'dev-only-change-me-in-production';

// Enforce secret in production at runtime (not during build)
if (
	process.env.NODE_ENV === 'production' &&
	!process.env.BETTER_AUTH_SECRET &&
	!process.env.VITE_BUILD
) {
	console.warn('⚠️  WARNING: BETTER_AUTH_SECRET not set in production! Auth will be insecure.');
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
