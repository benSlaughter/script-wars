import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getGame } from '$lib/server/games';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) throw error(401, 'Not authenticated');

	const game = getGame(params.gameId);

	return {
		defaultCode: game.defaultCode,
		testOpponentDescription: game.testOpponentDescription,
		editorDocs: game.getEditorDocs(),
		validMoves: game.validMoves
	};
};
