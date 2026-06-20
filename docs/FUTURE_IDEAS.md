# Script Wars — Future Ideas

A parking lot for ideas we might build someday. Not committed to, just captured.

---

## 🎮 Game Engine Enhancements

### Sequential / Phased Rounds
Allow games where players move in sequence (Player A acts, Player B sees A's move and responds). Would need a small `match-runner.ts` change — add `sequential?: boolean` and `phasesPerRound?: number` to GamePlugin. Backward-compatible (existing games stay simultaneous).

**Use cases:** Poker-style bet-then-reveal, attack-then-defend, bluffing games.

### Combo / Sequence Detection
Games where playing specific patterns across rounds triggers bonus effects. Already possible today via `getPoints()` reading history, but a formal `detectCombos()` hook could make it cleaner.

### Variable Round Counts
Games that end early when a condition is met (first to N points, knockout, etc.) rather than always running exactly 100 rounds. Would need a `shouldEndMatch()` hook.

### Team Matches
2v2 or NvN where scripts cooperate. Would need significant match runner changes.

### Persistent State Between Rounds
Let scripts store a small amount of state (e.g. a table) that persists across rounds, beyond just move history. Currently scripts are stateless — they only see history arrays.

---

## 🏆 Tournament & Ranking

### ELO Ratings
Proper ELO/Glicko-2 rating system instead of simple win/loss leaderboards. Track rating over time, show rating graphs.

### Tournament Brackets
Single/double elimination brackets in addition to round-robin. More dramatic for spectating.

### Seasons / Resets
Periodic leaderboard resets with historical season records.

### Match Replays
Store full round-by-round data and provide an animated replay viewer. Could be really fun to watch strategies unfold.

---

## 📝 Editor & DX

### Blockly Visual Editor
Drag-and-drop visual programming (Google Blockly) as an alternative to writing Lua. Lower the barrier to entry for non-programmers.

### Script Versioning
Git-like history for scripts — see diffs, revert to previous versions, compare performance across versions.

### Live Testing Panel
Run your script against all NPCs in one click and see results instantly in the editor.

### Strategy Playground
A sandbox where you can pit any two of your own scripts against each other and see the full round-by-round breakdown.

---

## 🌐 Social & Community

### Script Sharing
Publish scripts publicly so others can learn from strategies (opt-in, maybe after a tournament season ends).

### Comments / Reactions
Let players react to matches or comment on strategies.

### Challenges
Challenge a specific player to a friendly match (notification system).

### Spectator Mode
Watch live tournament matches as they happen.

---

## 🛠️ Infrastructure

### Re-enable Docker Build Caching
Currently disabled to prevent stale builds. Re-enable with proper cache key strategy (hash on package-lock.json for deps layer, bust on src changes).

### Multi-region Deployment
If the game gets popular, deploy to multiple regions. SQLite would need replacing with something distributed.

### WebSocket Live Updates
Real-time leaderboard updates and match notifications instead of polling.

---

## 🎯 Game Ideas

### Tic-Tac-Toe (sequential)
Would require the sequential rounds feature. Each "round" is one move placement.

### Auction Game
Players bid on items with limited currency. Point-based, resource management.

### Battle Royale
Multiple scripts in one match (not just 1v1). Last script standing wins. Big engine change.

### Evolution Game
Scripts that can "mutate" — small random changes applied between tournaments to see if strategies evolve.

---

*Add ideas here as they come up. When we're ready to build one, move it to a GitHub issue.*
