import type { GamePlugin } from './types.js';
import { rpsGame } from './rps.js';
import { prisonerGame } from './prisoners-dilemma.js';

/** All registered games */
const games: Map<string, GamePlugin> = new Map();

// Register games
games.set(rpsGame.id, rpsGame);
games.set(prisonerGame.id, prisonerGame);

/** Get a game by ID, or throw */
export function getGame(gameId: string): GamePlugin {
	const game = games.get(gameId);
	if (!game) throw new Error(`Unknown game: ${gameId}`);
	return game;
}

/** Get all registered games */
export function getAllGames(): GamePlugin[] {
	return [...games.values()];
}

/** Check if a game ID is valid */
export function isValidGame(gameId: string): boolean {
	return games.has(gameId);
}

export type { GamePlugin, ScriptContext, NpcDefinition, DocsSection, EditorDoc } from './types.js';
