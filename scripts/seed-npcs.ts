/**
 * Seed NPC bot accounts for tournaments.
 * Run with: npx tsx scripts/seed-npcs.ts
 */
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { nanoid } from 'nanoid';
import { join } from 'path';
import * as schema from '../src/lib/server/schema.js';
import { eq } from 'drizzle-orm';

const DB_PATH = process.env.DATABASE_URL ?? join(process.cwd(), 'data', 'script-wars.db');
const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
const db = drizzle(sqlite, { schema });

const NPC_BOTS = [
	{
		name: '🪨 Rocky',
		email: 'npc-rocky@script-wars.local',
		scriptName: 'Always Rock',
		code: `-- I am Rocky. I always play rock. Deal with it.
return "rock"`
	},
	{
		name: '🎲 Dice Roll',
		email: 'npc-dice@script-wars.local',
		scriptName: 'Random Picker',
		code: `-- Fate decides my moves
local moves = {"rock", "paper", "scissors"}
return moves[math.random(#moves)]`
	},
	{
		name: '🔄 Copycat',
		email: 'npc-copycat@script-wars.local',
		scriptName: 'Mirror Match',
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
		code: `-- I counter your last move
if #opponent_history == 0 then
  return "rock"
end
local last = opponent_history[#opponent_history]
local counter = { rock = "paper", paper = "scissors", scissors = "rock" }
return counter[last]`
	}
];

async function seed() {
	console.log('🌱 Seeding NPC bots...\n');

	for (const bot of NPC_BOTS) {
		// Check if already exists
		const [existing] = await db
			.select()
			.from(schema.users)
			.where(eq(schema.users.email, bot.email));

		if (existing) {
			console.log(`  ⏭️  ${bot.name} already exists`);
			continue;
		}

		const now = new Date();
		const userId = nanoid();
		const scriptId = nanoid();

		// Create user
		await db.insert(schema.users).values({
			id: userId,
			name: bot.name,
			email: bot.email,
			emailVerified: true,
			createdAt: now,
			updatedAt: now
		});

		// Create script (active)
		await db.insert(schema.scripts).values({
			id: scriptId,
			userId,
			name: bot.scriptName,
			code: bot.code,
			isActiveEntry: true,
			createdAt: now,
			updatedAt: now
		});

		console.log(`  ✅ ${bot.name} — "${bot.scriptName}"`);
	}

	console.log('\n🎮 NPCs ready for battle!');
	sqlite.close();
}

seed().catch(console.error);
