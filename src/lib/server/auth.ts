import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db.js';
import * as schema from './schema.js';

const secret = process.env.BETTER_AUTH_SECRET ?? 'dev-only-change-me-in-production';

if (process.env.NODE_ENV === 'production' && !process.env.BETTER_AUTH_SECRET) {
	throw new Error('BETTER_AUTH_SECRET must be set in production');
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
