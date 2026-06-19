import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { scripts } from '$lib/server/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) throw error(401, 'Not authenticated');

	const body = await request.json();
	const { id } = body;

	if (!id) throw error(400, 'Script ID is required');

	// Verify ownership
	const [existing] = await db
		.select()
		.from(scripts)
		.where(and(eq(scripts.id, id), eq(scripts.userId, session.user.id)));

	if (!existing) throw error(404, 'Script not found');

	// Deactivate all scripts for this user in the same game
	await db
		.update(scripts)
		.set({ isActiveEntry: false, updatedAt: new Date() })
		.where(and(eq(scripts.userId, session.user.id), eq(scripts.gameId, existing.gameId)));

	// Activate the chosen one
	const [updated] = await db
		.update(scripts)
		.set({ isActiveEntry: true, updatedAt: new Date() })
		.where(eq(scripts.id, id))
		.returning();

	return json(updated);
};
