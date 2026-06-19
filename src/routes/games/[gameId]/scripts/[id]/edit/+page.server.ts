import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { scripts } from '$lib/server/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import { getGame } from '$lib/server/games';

export const load: PageServerLoad = async ({ params, request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) throw error(401, 'Not authenticated');

	const game = getGame(params.gameId);

	const [script] = await db
		.select()
		.from(scripts)
		.where(
			and(
				eq(scripts.id, params.id),
				eq(scripts.userId, session.user.id),
				eq(scripts.gameId, params.gameId)
			)
		);

	if (!script) throw error(404, 'Script not found');

	return {
		script,
		testOpponentDescription: game.testOpponentDescription,
		editorDocs: game.getEditorDocs()
	};
};
