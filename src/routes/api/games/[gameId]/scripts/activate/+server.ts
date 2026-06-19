import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { scripts } from '$lib/server/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import { isValidGame } from '$lib/server/games';

export const POST: RequestHandler = async ({ request, params }) => {
	const { gameId } = params;
	if (!isValidGame(gameId)) throw error(404, 'Game not found');

	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) throw error(401, 'Not authenticated');

	const { id } = await request.json();
	if (!id) throw error(400, 'Script ID is required');

	// Verify ownership and game
	const [script] = await db
		.select()
		.from(scripts)
		.where(and(eq(scripts.id, id), eq(scripts.userId, session.user.id), eq(scripts.gameId, gameId)));

	if (!script) throw error(404, 'Script not found');

	// Deactivate all other scripts for this user+game
	await db
		.update(scripts)
		.set({ isActiveEntry: false, updatedAt: new Date() })
		.where(and(eq(scripts.userId, session.user.id), eq(scripts.gameId, gameId)));

	// Activate this one
	await db
		.update(scripts)
		.set({ isActiveEntry: true, updatedAt: new Date() })
		.where(eq(scripts.id, id));

	return json({ success: true });
};
