import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { scripts } from '$lib/server/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { auth } from '$lib/server/auth';
import { isValidGame } from '$lib/server/games';

async function getUser(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) throw error(401, 'Not authenticated');
	return session.user;
}

export const GET: RequestHandler = async ({ request, params }) => {
	const { gameId } = params;
	if (!isValidGame(gameId)) throw error(404, 'Game not found');

	const user = await getUser(request);

	const userScripts = await db
		.select()
		.from(scripts)
		.where(and(eq(scripts.userId, user.id), eq(scripts.gameId, gameId)))
		.orderBy(scripts.updatedAt);

	return json(userScripts);
};

export const POST: RequestHandler = async ({ request, params }) => {
	const { gameId } = params;
	if (!isValidGame(gameId)) throw error(404, 'Game not found');

	const user = await getUser(request);
	const body = await request.json();

	const { name, code } = body;
	if (!name || typeof name !== 'string' || name.trim().length === 0) {
		throw error(400, 'Script name is required');
	}
	if (!code || typeof code !== 'string') {
		throw error(400, 'Script code is required');
	}
	if (name.length > 100) {
		throw error(400, 'Script name must be under 100 characters');
	}
	if (code.length > 10000) {
		throw error(400, 'Script code must be under 10,000 characters');
	}

	const now = new Date();
	const id = nanoid();

	// Check how many scripts this user has for this game (limit to 20)
	const existing = await db
		.select()
		.from(scripts)
		.where(and(eq(scripts.userId, user.id), eq(scripts.gameId, gameId)));

	if (existing.length >= 20) {
		throw error(400, 'Maximum 20 scripts per game');
	}

	const [newScript] = await db
		.insert(scripts)
		.values({
			id,
			userId: user.id,
			gameId,
			name: name.trim(),
			code,
			isActiveEntry: existing.length === 0,
			createdAt: now,
			updatedAt: now
		})
		.returning();

	return json(newScript, { status: 201 });
};

export const PUT: RequestHandler = async ({ request, params }) => {
	const { gameId } = params;
	if (!isValidGame(gameId)) throw error(404, 'Game not found');

	const user = await getUser(request);
	const body = await request.json();

	const { id, name, code } = body;
	if (!id) throw error(400, 'Script ID is required');

	const [existing] = await db
		.select()
		.from(scripts)
		.where(and(eq(scripts.id, id), eq(scripts.userId, user.id), eq(scripts.gameId, gameId)));

	if (!existing) throw error(404, 'Script not found');

	const updates: Record<string, unknown> = { updatedAt: new Date() };
	if (name !== undefined) {
		if (typeof name !== 'string' || name.trim().length === 0) throw error(400, 'Invalid name');
		if (name.length > 100) throw error(400, 'Name must be under 100 characters');
		updates.name = name.trim();
	}
	if (code !== undefined) {
		if (typeof code !== 'string') throw error(400, 'Invalid code');
		if (code.length > 10000) throw error(400, 'Code must be under 10,000 characters');
		updates.code = code;
	}

	const [updated] = await db
		.update(scripts)
		.set(updates)
		.where(eq(scripts.id, id))
		.returning();

	return json(updated);
};

export const DELETE: RequestHandler = async ({ request, params }) => {
	const { gameId } = params;
	if (!isValidGame(gameId)) throw error(404, 'Game not found');

	const user = await getUser(request);
	const body = await request.json();
	const { id } = body;

	if (!id) throw error(400, 'Script ID is required');

	const [existing] = await db
		.select()
		.from(scripts)
		.where(and(eq(scripts.id, id), eq(scripts.userId, user.id), eq(scripts.gameId, gameId)));

	if (!existing) throw error(404, 'Script not found');

	await db.delete(scripts).where(eq(scripts.id, id));

	if (existing.isActiveEntry) {
		const [nextScript] = await db
			.select()
			.from(scripts)
			.where(and(eq(scripts.userId, user.id), eq(scripts.gameId, gameId)))
			.limit(1);

		if (nextScript) {
			await db
				.update(scripts)
				.set({ isActiveEntry: true, updatedAt: new Date() })
				.where(eq(scripts.id, nextScript.id));
		}
	}

	return json({ success: true });
};
