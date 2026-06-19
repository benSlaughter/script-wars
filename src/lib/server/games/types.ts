/**
 * Game Plugin Interface
 * Each game implements this to plug into the Script Wars platform.
 */

export interface GamePlugin {
	/** Unique identifier (used in URLs and DB) */
	id: string;
	/** Display name */
	name: string;
	/** Short description */
	description: string;
	/** Emoji icon */
	icon: string;
	/** Valid moves a script can return */
	validMoves: string[];
	/** Number of rounds per match */
	maxRounds: number;
	/** Whether scoring is point-based (true) or win/loss per round (false) */
	pointBased: boolean;

	/** Check if a move is valid */
	isValidMove(move: string): boolean;

	/** Resolve a single round — returns who won */
	resolveRound(moveA: string, moveB: string): 'a' | 'b' | 'draw';

	/** Get points awarded for a round (default: win=1, loss=0, draw=0) */
	getPoints(moveA: string, moveB: string): [number, number];

	/** Build the Lua context for a round */
	buildContext(round: number, myHistory: string[], opponentHistory: string[]): ScriptContext;

	/** Get NPC definitions for this game */
	getNpcs(): NpcDefinition[];

	/** Get game-specific docs sections */
	getDocsSections(): DocsSection[];
}

export interface ScriptContext {
	opponent_history: string[];
	my_history: string[];
	round_number: number;
	[key: string]: unknown;
}

export interface NpcDefinition {
	name: string;
	email: string;
	code: string;
}

export interface DocsSection {
	title: string;
	content: string; // HTML content
}
