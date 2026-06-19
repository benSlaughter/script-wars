import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { scripts, matches } from '$lib/server/schema';
import { eq, and, or } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { auth } from '$lib/server/auth';

async function getUser(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) throw error(401, 'Not authenticated');
	return session.user;
}

export const GET: RequestHandler = async ({ request }) => {
	const user = await getUser(request);

	const userScripts = await db
		.select()
		.from(scripts)
		.where(eq(scripts.userId, user.id))
		.orderBy(scripts.updatedAt);

	return json(userScripts);
};

export const POST: RequestHandler = async ({ request }) => {
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

	// Check how many scripts this user has (limit to 20)
	const existing = await db
		.select()
		.from(scripts)
		.where(eq(scripts.userId, user.id));

	if (existing.length >= 20) {
		throw error(400, 'Maximum 20 scripts per account');
	}

	const [newScript] = await db
		.insert(scripts)
		.values({
			id,
			userId: user.id,
			name: name.trim(),
			code,
			isActiveEntry: existing.length === 0, // First script is auto-active
			createdAt: now,
			updatedAt: now
		})
		.returning();

	return json(newScript, { status: 201 });
};

export const PUT: RequestHandler = async ({ request }) => {
	const user = await getUser(request);
	const body = await request.json();

	const { id, name, code } = body;
	if (!id) throw error(400, 'Script ID is required');

	// Verify ownership
	const [existing] = await db
		.select()
		.from(scripts)
		.where(and(eq(scripts.id, id), eq(scripts.userId, user.id)));

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

export const DELETE: RequestHandler = async ({ request }) => {
	const user = await getUser(request);
	const body = await request.json();
	const { id } = body;

	if (!id) throw error(400, 'Script ID is required');

	// Verify ownership
	const [existing] = await db
		.select()
		.from(scripts)
		.where(and(eq(scripts.id, id), eq(scripts.userId, user.id)));

	if (!existing) throw error(404, 'Script not found');

	// Delete matches referencing this script (FK constraint)
	await db.delete(matches).where(
		or(
			eq(matches.scriptAId, id),
			eq(matches.scriptBId, id),
			eq(matches.winnerId, id)
		)
	);

	await db.delete(scripts).where(eq(scripts.id, id));

	// If this was the active entry, promote another script
	if (existing.isActiveEntry) {
		const [nextScript] = await db
			.select()
			.from(scripts)
			.where(eq(scripts.userId, user.id))
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
