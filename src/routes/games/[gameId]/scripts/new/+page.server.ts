import type { PageServerLoad } from './$types';
import { getGame } from '$lib/server/games';

export const load: PageServerLoad = ({ params }) => {
	const game = getGame(params.gameId);

	return {
		defaultCode: game.defaultCode,
		testOpponentDescription: game.testOpponentDescription,
		editorDocs: game.getEditorDocs(),
		validMoves: game.validMoves
	};
};
