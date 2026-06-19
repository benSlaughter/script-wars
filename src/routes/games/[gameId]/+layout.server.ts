import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { isValidGame, getGame } from '$lib/server/games';

export const load: LayoutServerLoad = ({ params }) => {
	const { gameId } = params;

	if (!isValidGame(gameId)) {
		throw error(404, `Game "${gameId}" not found`);
	}

	const game = getGame(gameId);

	return {
		gameId: game.id,
		gameName: game.name,
		gameIcon: game.icon,
		gameDescription: game.description
	};
};
