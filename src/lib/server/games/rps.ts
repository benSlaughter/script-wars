import type { GamePlugin, ScriptContext, NpcDefinition, DocsSection, EditorDoc } from './types.js';

const VALID_MOVES = ['rock', 'paper', 'scissors'] as const;

const WINS_AGAINST: Record<string, string> = {
	rock: 'scissors',
	paper: 'rock',
	scissors: 'paper'
};

export const rpsGame: GamePlugin = {
	id: 'rps',
	name: 'Rock Paper Scissors',
	description: 'The classic game of strategy and chance. Outsmart your opponent over 100 rounds.',
	icon: '✊',
	validMoves: [...VALID_MOVES],
	maxRounds: 100,
	pointBased: false,

	defaultCode: `-- Your battle script!
-- Return "rock", "paper", or "scissors"
-- You have access to: opponent_history, my_history, round_number

local moves = {"rock", "paper", "scissors"}
return moves[math.random(#moves)]
`,

	testOpponentDescription: 'who always plays "rock"',

	isValidMove(move: string): boolean {
		return VALID_MOVES.includes(move as (typeof VALID_MOVES)[number]);
	},

	resolveRound(moveA: string, moveB: string): 'a' | 'b' | 'draw' {
		if (moveA === moveB) return 'draw';
		return WINS_AGAINST[moveA] === moveB ? 'a' : 'b';
	},

	getPoints(moveA: string, moveB: string): [number, number] {
		const result = this.resolveRound(moveA, moveB);
		if (result === 'a') return [1, 0];
		if (result === 'b') return [0, 1];
		return [0, 0];
	},

	buildContext(round: number, myHistory: string[], opponentHistory: string[]): ScriptContext {
		return {
			opponent_history: opponentHistory,
			my_history: myHistory,
			round_number: round
		};
	},

	getNpcs(): NpcDefinition[] {
		return [
			{
				name: '🪨 Rocky',
				email: 'npc-rocky@script-wars.local',
				code: `-- I am Rocky. I always play rock. Deal with it.\nreturn "rock"`
			},
			{
				name: '🎲 Dice Roll',
				email: 'npc-dice@script-wars.local',
				code: `-- Fate decides my moves\nlocal moves = {"rock", "paper", "scissors"}\nreturn moves[math.random(#moves)]`
			},
			{
				name: '🔄 Copycat',
				email: 'npc-copycat@script-wars.local',
				code: `-- I copy your last move. First round? Rock.\nif #opponent_history == 0 then\n  return "rock"\nend\nreturn opponent_history[#opponent_history]`
			}
		];
	},

	getDocsSections(): DocsSection[] {
		return [
			{
				title: '🎯 How It Works',
				content: `<p>Each match is <strong>100 rounds</strong>. Your script runs once per round and must return <code>"rock"</code>, <code>"paper"</code>, or <code>"scissors"</code>.</p>
<ul>
<li>Rock beats Scissors</li>
<li>Paper beats Rock</li>
<li>Scissors beats Paper</li>
<li>Same move = draw</li>
</ul>`
			},
			{
				title: '🎮 Game Context',
				content: `<p>Your script has access to:</p>
<table>
<tr><td><code>round_number</code></td><td>Current round (1–100)</td></tr>
<tr><td><code>opponent_history</code></td><td>Table of opponent's previous moves</td></tr>
<tr><td><code>my_history</code></td><td>Table of your previous moves</td></tr>
</table>`
			}
		];
	},

	getEditorDocs(): EditorDoc[] {
		return [
			{
				title: 'Your script must return:',
				content: `<code>"rock"</code>, <code>"paper"</code>, or <code>"scissors"</code>`
			},
			{
				title: 'Available variables:',
				content: `<dl>
<dt><code>opponent_history</code></dt><dd>Table of opponent's previous moves</dd>
<dt><code>my_history</code></dt><dd>Table of your previous moves</dd>
<dt><code>round_number</code></dt><dd>Current round (1-based)</dd>
</dl>`
			},
			{
				title: 'Useful functions:',
				content: `<dl>
<dt><code>math.random(n)</code></dt><dd>Random integer 1 to n</dd>
<dt><code>#table</code></dt><dd>Length of a table</dd>
<dt><code>table[i]</code></dt><dd>Get item at index i</dd>
</dl>`
			}
		];
	}
};
