import type { GamePlugin, ScriptContext, NpcDefinition, DocsSection, EditorDoc } from './types.js';

const VALID_MOVES = ['share', 'steal'] as const;

export const prisonerGame: GamePlugin = {
	id: 'prisoners-dilemma',
	name: "Prisoner's Dilemma",
	description: 'Share or Steal — cooperate for mutual gain, or betray for a bigger reward. Trust is everything.',
	icon: '🤝',
	validMoves: [...VALID_MOVES],
	maxRounds: 100,
	pointBased: true,

	defaultCode: `-- Your strategy script!
-- Return "share" or "steal"
-- You have access to: opponent_history, my_history, round_number

-- Share/Share = 3pts each, Steal/Steal = 1pt each
-- Share/Steal = 0/5 pts

return "share"
`,

	testOpponentDescription: 'who always plays "share"',

	isValidMove(move: string): boolean {
		return VALID_MOVES.includes(move as (typeof VALID_MOVES)[number]);
	},

	resolveRound(moveA: string, moveB: string): 'a' | 'b' | 'draw' {
		// Both same = draw, one steals = stealer wins the round
		if (moveA === moveB) return 'draw';
		return moveA === 'steal' ? 'a' : 'b';
	},

	getPoints(moveA: string, moveB: string): [number, number] {
		if (moveA === 'share' && moveB === 'share') return [3, 3];
		if (moveA === 'share' && moveB === 'steal') return [0, 5];
		if (moveA === 'steal' && moveB === 'share') return [5, 0];
		// steal/steal
		return [1, 1];
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
				name: '😇 Always Share',
				email: 'npc-pd-share@script-wars.local',
				code: `-- I believe in cooperation\nreturn "share"`
			},
			{
				name: '😈 Always Steal',
				email: 'npc-pd-steal@script-wars.local',
				code: `-- Trust no one\nreturn "steal"`
			},
			{
				name: '🎲 Random',
				email: 'npc-pd-random@script-wars.local',
				code: `-- Chaos agent\nlocal moves = {"share", "steal"}\nreturn moves[math.random(#moves)]`
			}
		];
	},

	getDocsSections(): DocsSection[] {
		return [
			{
				title: '🎯 How It Works',
				content: `<p>Each match is <strong>100 rounds</strong>. Your script runs once per round and must return <code>"share"</code> or <code>"steal"</code>.</p>
<table>
<tr><th>You</th><th>Opponent</th><th>Your Points</th><th>Their Points</th></tr>
<tr><td>Share</td><td>Share</td><td>3</td><td>3</td></tr>
<tr><td>Steal</td><td>Share</td><td>5</td><td>0</td></tr>
<tr><td>Share</td><td>Steal</td><td>0</td><td>5</td></tr>
<tr><td>Steal</td><td>Steal</td><td>1</td><td>1</td></tr>
</table>
<p>After 100 rounds, the player with the <strong>most total points</strong> wins the match.</p>
<p><strong>The dilemma:</strong> Mutual sharing scores 300 each (3×100). Mutual stealing only scores 100 each (1×100). But if you share and they steal, you get nothing while they get 500. Can you build trust?</p>`
			},
			{
				title: '🎮 Game Context',
				content: `<p>Your script has access to:</p>
<table>
<tr><td><code>round_number</code></td><td>Current round (1–100)</td></tr>
<tr><td><code>opponent_history</code></td><td>Table of opponent's previous moves (<code>"share"</code> or <code>"steal"</code>)</td></tr>
<tr><td><code>my_history</code></td><td>Table of your previous moves</td></tr>
</table>`
			},
			{
				title: '💡 Strategy Ideas',
				content: `<ul>
<li><strong>Tit for Tat</strong> — Start sharing, then copy what they did last round</li>
<li><strong>Grudger</strong> — Share until they steal once, then steal forever</li>
<li><strong>Pavlov</strong> — If you won last round, repeat your move. If you lost, switch</li>
<li><strong>Detective</strong> — Play share, steal, share, share to probe their strategy, then adapt</li>
<li><strong>Forgiving TfT</strong> — Like Tit for Tat but occasionally forgive a single betrayal</li>
</ul>`
			}
		];
	},

	getEditorDocs(): EditorDoc[] {
		return [
			{
				title: 'Your script must return:',
				content: `<code>"share"</code> or <code>"steal"</code>`
			},
			{
				title: 'Scoring:',
				content: `<table>
<tr><td>Share + Share</td><td>3 / 3 pts</td></tr>
<tr><td>Steal + Share</td><td>5 / 0 pts</td></tr>
<tr><td>Steal + Steal</td><td>1 / 1 pts</td></tr>
</table>`
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
