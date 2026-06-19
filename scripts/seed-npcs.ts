/**
 * Seed NPC bot accounts for tournaments.
 * Run with: npx tsx scripts/seed-npcs.ts
 */
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { nanoid } from 'nanoid';
import { join } from 'path';
import * as schema from '../src/lib/server/schema.js';
import { eq, and } from 'drizzle-orm';

const DB_PATH = process.env.DATABASE_URL ?? join(process.cwd(), 'data', 'script-wars.db');
const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
const db = drizzle(sqlite, { schema });

interface NpcBot {
	name: string;
	email: string;
	scriptName: string;
	code: string;
	gameId: string;
}

const NPC_BOTS: NpcBot[] = [
	// RPS bots
	{
		name: '🪨 Rocky',
		email: 'npc-rocky@script-wars.local',
		scriptName: 'Always Rock',
		gameId: 'rps',
		code: `-- I am Rocky. I always play rock. Deal with it.
return "rock"`
	},
	{
		name: '🎲 Dice Roll',
		email: 'npc-dice@script-wars.local',
		scriptName: 'Random Picker',
		gameId: 'rps',
		code: `-- Fate decides my moves
local moves = {"rock", "paper", "scissors"}
return moves[math.random(#moves)]`
	},
	{
		name: '🔄 Copycat',
		email: 'npc-copycat@script-wars.local',
		scriptName: 'Mirror Match',
		gameId: 'rps',
		code: `-- I copy your last move. First round? Rock.
if #opponent_history == 0 then
  return "rock"
end
return opponent_history[#opponent_history]`
	},
	{
		name: '🧠 Counter',
		email: 'npc-counter@script-wars.local',
		scriptName: 'Counter Strike',
		gameId: 'rps',
		code: `-- I counter your last move
if #opponent_history == 0 then
  return "rock"
end
local last = opponent_history[#opponent_history]
local counter = { rock = "paper", paper = "scissors", scissors = "rock" }
return counter[last]`
	},
	// Prisoner's Dilemma bots
	{
		name: '😇 Always Share',
		email: 'npc-pd-share@script-wars.local',
		scriptName: 'Naive Cooperator',
		gameId: 'prisoners-dilemma',
		code: `-- I believe in cooperation
return "share"`
	},
	{
		name: '😈 Always Steal',
		email: 'npc-pd-steal@script-wars.local',
		scriptName: 'Greedy Thief',
		gameId: 'prisoners-dilemma',
		code: `-- Trust no one
return "steal"`
	},
	{
		name: '🪞 Tit for Tat',
		email: 'npc-pd-tft@script-wars.local',
		scriptName: 'Mirror Strategy',
		gameId: 'prisoners-dilemma',
		code: `-- Start nice, then copy opponent
if #opponent_history == 0 then
  return "share"
end
return opponent_history[#opponent_history]`
	},
	{
		name: '🕊️ Forgiving TfT',
		email: 'npc-pd-ftft@script-wars.local',
		scriptName: 'Second Chance',
		gameId: 'prisoners-dilemma',
		code: `-- Like Tit for Tat, but forgive one betrayal
if #opponent_history == 0 then
  return "share"
end
if opponent_history[#opponent_history] == "steal" then
  if #opponent_history >= 2 and opponent_history[#opponent_history - 1] == "share" then
    return "share"
  end
  return "steal"
end
return "share"`
	},
	{
		name: '🎲 Random',
		email: 'npc-pd-random@script-wars.local',
		scriptName: 'Chaos Agent',
		gameId: 'prisoners-dilemma',
		code: `-- Chaos agent
local moves = {"share", "steal"}
return moves[math.random(#moves)]`
	}
];

async function seed() {
	console.log('🌱 Seeding NPC bots...\n');

	for (const bot of NPC_BOTS) {
		// Check if user already exists
		const [existing] = await db
			.select()
			.from(schema.users)
			.where(eq(schema.users.email, bot.email));

		let userId: string;

		if (existing) {
			userId = existing.id;
			// Check if they have a script for this game
			const [existingScript] = await db
				.select()
				.from(schema.scripts)
				.where(and(eq(schema.scripts.userId, userId), eq(schema.scripts.gameId, bot.gameId)));

			if (existingScript) {
				console.log(`  ⏭️  ${bot.name} (${bot.gameId}) already exists`);
				continue;
			}
		} else {
			// Create user
			const now = new Date();
			userId = nanoid();
			await db.insert(schema.users).values({
				id: userId,
				name: bot.name,
				email: bot.email,
				emailVerified: true,
				createdAt: now,
				updatedAt: now
			});
		}

		// Create script (active)
		const now = new Date();
		const scriptId = nanoid();
		await db.insert(schema.scripts).values({
			id: scriptId,
			userId,
			gameId: bot.gameId,
			name: bot.scriptName,
			code: bot.code,
			isActiveEntry: true,
			createdAt: now,
			updatedAt: now
		});

		console.log(`  ✅ ${bot.name} — "${bot.scriptName}" (${bot.gameId})`);
	}

	console.log('\n🎮 NPCs ready for battle!');
	sqlite.close();
}

seed().catch(console.error);
