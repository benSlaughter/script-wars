# Creating a Game Plugin

Adding a new game to Script Wars is designed to be dead simple. You create **one file**, register it, and the platform handles everything else — matchmaking, tournaments, leaderboards, the script editor, NPC bots, and docs.

## Quick Overview

A game plugin is a single TypeScript file that implements the `GamePlugin` interface. The platform asks your plugin:

- What moves are valid?
- Who wins a round?
- How many points does each player get?
- What context do scripts have?
- What NPCs should exist?
- What docs should the editor show?

That's it. The match engine, tournament runner, UI, and API are all game-agnostic.

## Step-by-Step

### 1. Create your game file

Create `src/lib/server/games/your-game.ts`:

```typescript
import type { GamePlugin, ScriptContext, NpcDefinition, DocsSection, EditorDoc } from './types.js';

const VALID_MOVES = ['move1', 'move2', 'move3'] as const;

export const yourGame: GamePlugin = {
  id: 'your-game',                    // URL-safe slug (used in URLs and DB)
  name: 'Your Game Name',             // Display name
  description: 'One-line pitch.',     // Shown on the games list
  icon: '🎮',                         // Emoji shown in UI
  validMoves: [...VALID_MOVES],
  maxRounds: 100,                     // Rounds per match
  pointBased: false,                  // true = highest score wins, false = most rounds won wins

  defaultCode: `-- Your starter template
-- Return one of: "move1", "move2", "move3"
return "move1"
`,

  testOpponentDescription: 'who always plays "move1"',

  isValidMove(move: string): boolean {
    return VALID_MOVES.includes(move as any);
  },

  resolveRound(moveA: string, moveB: string): 'a' | 'b' | 'draw' {
    // Your game logic here
    if (moveA === moveB) return 'draw';
    // ... determine winner
    return 'a'; // or 'b' or 'draw'
  },

  getPoints(moveA: string, moveB: string): [number, number] {
    // Points awarded to [playerA, playerB]
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
      // Add game-specific context here (e.g. scores, special state)
    };
  },

  getNpcs(): NpcDefinition[] {
    return [
      {
        name: '🤖 Basic Bot',
        email: 'npc-yourgame-basic@script-wars.local',
        code: `return "move1"`
      }
    ];
  },

  getDocsSections(): DocsSection[] {
    return [
      {
        title: '🎯 How It Works',
        content: `<p>Explain your game rules here as HTML.</p>`
      },
      {
        title: '🎮 Game Context',
        content: `<p>Document what variables scripts have access to.</p>`
      }
    ];
  },

  getEditorDocs(): EditorDoc[] {
    return [
      {
        title: 'Your script must return:',
        content: `<code>"move1"</code>, <code>"move2"</code>, or <code>"move3"</code>`
      },
      {
        title: 'Available variables:',
        content: `<dl>
<dt><code>opponent_history</code></dt><dd>Table of opponent's previous moves</dd>
<dt><code>my_history</code></dt><dd>Table of your previous moves</dd>
<dt><code>round_number</code></dt><dd>Current round (1-based)</dd>
</dl>`
      }
    ];
  }
};
```

### 2. Register your game

Open `src/lib/server/games/index.ts` and add two lines:

```typescript
import { yourGame } from './your-game.js';

// In the registration section:
games.set(yourGame.id, yourGame);
```

### 3. Run the NPC seeder

```bash
npm run seed:npcs
```

This creates the NPC bot accounts for your game (it's idempotent — safe to run multiple times).

### 4. Done! 🎉

That's literally it. The platform automatically:

- ✅ Adds your game to the games list page
- ✅ Creates a script editor with your default code and docs
- ✅ Runs matches using your `resolveRound` and `getPoints` logic
- ✅ Includes your game in automatic tournaments
- ✅ Shows a separate leaderboard for your game
- ✅ Creates a "friendly match" mode with your test opponent
- ✅ Validates moves using your `isValidMove` function

## Interface Reference

### `GamePlugin`

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | URL-safe identifier (e.g. `"rps"`, `"prisoners-dilemma"`) |
| `name` | `string` | Human-readable display name |
| `description` | `string` | One-line description for the games list |
| `icon` | `string` | Emoji displayed in the UI |
| `validMoves` | `string[]` | All legal moves |
| `maxRounds` | `number` | Number of rounds per match |
| `pointBased` | `boolean` | `true` = highest total score wins; `false` = most rounds won wins |

| Method | Returns | Description |
|--------|---------|-------------|
| `isValidMove(move)` | `boolean` | Is this a legal move? |
| `resolveRound(moveA, moveB)` | `'a' \| 'b' \| 'draw'` | Who won this round? |
| `getPoints(moveA, moveB)` | `[number, number]` | Points for [A, B] this round |
| `buildContext(round, myHistory, opponentHistory)` | `ScriptContext` | What variables the Lua script sees |
| `getNpcs()` | `NpcDefinition[]` | NPC bots for this game |
| `getDocsSections()` | `DocsSection[]` | Full docs page sections |
| `getEditorDocs()` | `EditorDoc[]` | Compact sidebar docs in the editor |

### `pointBased` Scoring

- **`false` (round-based)**: Like RPS — each round has a winner, most round-wins takes the match. Points from `getPoints` are tracked but the winner is determined by round count.
- **`true` (point-based)**: Like Prisoner's Dilemma — points accumulate across rounds, highest total score wins the match.

### Error Handling

If a script errors or returns an invalid move, it forfeits that round:
- **Round-based games**: Opponent wins the round
- **Point-based games**: Opponent gets the maximum single-round points (you should design so `forfeitPoints = 5` or similar makes sense — see Prisoner's Dilemma where steal vs share = 5 points)

### NPC Email Convention

NPC bot emails must be unique and use the `@script-wars.local` domain:

```
npc-{game}-{name}@script-wars.local
```

## Design Tips

- **Keep moves simple** — strings that are easy to return from Lua
- **100 rounds is a good default** — long enough for strategies to emerge
- **Include 2-3 NPCs** with different strategies (naive, random, adaptive)
- **Use `pointBased: true`** if your game has asymmetric payoffs (like Prisoner's Dilemma)
- **Use `pointBased: false`** if rounds are winner-takes-all (like RPS)
- **Add strategy hints** in `getDocsSections()` — players love these

## Example: Complete Game (Coin Match)

Here's a minimal but complete game — players guess heads or tails, and whoever matches a hidden coin flip wins:

```typescript
import type { GamePlugin, ScriptContext, NpcDefinition, DocsSection, EditorDoc } from './types.js';

const VALID_MOVES = ['heads', 'tails'] as const;

export const coinMatchGame: GamePlugin = {
  id: 'coin-match',
  name: 'Coin Match',
  description: 'Predict whether your opponent calls heads or tails. Mind games only.',
  icon: '🪙',
  validMoves: [...VALID_MOVES],
  maxRounds: 100,
  pointBased: false,

  defaultCode: `-- Predict: will they pick "heads" or "tails"?
-- If you match their choice, you win the round!
local choices = {"heads", "tails"}
return choices[math.random(#choices)]
`,

  testOpponentDescription: 'who always plays "heads"',

  isValidMove(move: string): boolean {
    return VALID_MOVES.includes(move as any);
  },

  resolveRound(moveA: string, moveB: string): 'a' | 'b' | 'draw' {
    if (moveA === moveB) return 'draw';
    return moveA === 'heads' ? 'a' : 'b';
  },

  getPoints(moveA: string, moveB: string): [number, number] {
    const result = this.resolveRound(moveA, moveB);
    if (result === 'a') return [1, 0];
    if (result === 'b') return [0, 1];
    return [0, 0];
  },

  buildContext(round: number, myHistory: string[], opponentHistory: string[]): ScriptContext {
    return { opponent_history: opponentHistory, my_history: myHistory, round_number: round };
  },

  getNpcs(): NpcDefinition[] {
    return [
      { name: '🪙 Lucky Penny', email: 'npc-coin-lucky@script-wars.local', code: `return "heads"` },
      { name: '🎲 Flipper', email: 'npc-coin-flip@script-wars.local', code: `local c = {"heads","tails"}\nreturn c[math.random(#c)]` }
    ];
  },

  getDocsSections(): DocsSection[] {
    return [{
      title: '🎯 How It Works',
      content: `<p>Each round, both players choose <code>"heads"</code> or <code>"tails"</code>.</p>
<ul><li>Same choice = draw</li><li>Different = whoever played "heads" wins</li></ul>
<p>Win the most rounds out of 100 to win the match.</p>`
    }];
  },

  getEditorDocs(): EditorDoc[] {
    return [
      { title: 'Return:', content: `<code>"heads"</code> or <code>"tails"</code>` },
      { title: 'Variables:', content: `<code>opponent_history</code>, <code>my_history</code>, <code>round_number</code>` }
    ];
  }
};
```

Then register it in `index.ts`:

```typescript
import { coinMatchGame } from './coin-match.js';
games.set(coinMatchGame.id, coinMatchGame);
```

Run `npm run seed:npcs` and you're live!
