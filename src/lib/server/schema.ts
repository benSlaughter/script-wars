import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).default(false),
	image: text('image'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	token: text('token').notNull().unique(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const accounts = sqliteTable('accounts', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
	refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
	scope: text('scope'),
	idToken: text('id_token'),
	password: text('password'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const verifications = sqliteTable('verifications', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const scripts = sqliteTable('scripts', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	gameId: text('game_id').notNull().default('rps'),
	name: text('name').notNull(),
	code: text('code').notNull(),
	isActiveEntry: integer('is_active_entry', { mode: 'boolean' }).default(false),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const tournaments = sqliteTable('tournaments', {
	id: text('id').primaryKey(),
	gameId: text('game_id').notNull().default('rps'),
	status: text('status', { enum: ['pending', 'running', 'complete'] })
		.notNull()
		.default('pending'),
	startedAt: integer('started_at', { mode: 'timestamp' }),
	completedAt: integer('completed_at', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const matches = sqliteTable('matches', {
	id: text('id').primaryKey(),
	gameId: text('game_id').notNull().default('rps'),
	tournamentId: text('tournament_id').references(() => tournaments.id),
	scriptAId: text('script_a_id')
		.notNull()
		.references(() => scripts.id),
	scriptBId: text('script_b_id')
		.notNull()
		.references(() => scripts.id),
	winnerId: text('winner_id').references(() => scripts.id),
	rounds: integer('rounds').notNull().default(100),
	winsA: integer('wins_a').notNull().default(0),
	winsB: integer('wins_b').notNull().default(0),
	draws: integer('draws').notNull().default(0),
	matchType: text('match_type', { enum: ['tournament', 'friendly'] }).notNull().default('tournament'),
	scoreA: integer('score_a').notNull().default(0),
	scoreB: integer('score_b').notNull().default(0),
	playedAt: integer('played_at', { mode: 'timestamp' }).notNull()
});
