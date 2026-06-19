/**
 * Lightweight migration runner for production.
 * Applies all SQL files in /app/drizzle/ in order, tracking which have been applied.
 */
import Database from 'better-sqlite3';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const DB_PATH = process.env.DATABASE_URL ?? join(process.cwd(), 'data', 'script-wars.db');
const MIGRATIONS_DIR = join(process.cwd(), 'drizzle');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create migrations tracking table
db.exec(`
  CREATE TABLE IF NOT EXISTS _migrations (
    name TEXT PRIMARY KEY,
    applied_at TEXT DEFAULT (datetime('now'))
  )
`);

const applied = new Set(
	db.prepare('SELECT name FROM _migrations').all().map((r) => r.name)
);

// If the migrations table was just created but tables already exist,
// mark all existing migrations as applied (bootstrap scenario)
if (applied.size === 0) {
	const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
	if (tableCheck) {
		console.log('  ℹ️  Existing database detected — marking migrations as applied');
		const files = readdirSync(MIGRATIONS_DIR)
			.filter((f) => f.endsWith('.sql'))
			.sort();
		for (const file of files) {
			db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file);
			applied.add(file);
		}
		console.log(`  ✓ Marked ${files.length} migration(s) as applied`);
		db.close();
		process.exit(0);
	}
}

const files = readdirSync(MIGRATIONS_DIR)
	.filter((f) => f.endsWith('.sql'))
	.sort();

let count = 0;
for (const file of files) {
	if (applied.has(file)) continue;

	const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8');
	console.log(`  Applying: ${file}`);

	db.exec(sql);
	db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file);
	count++;
}

console.log(count > 0 ? `  ✓ Applied ${count} migration(s)` : '  ✓ Database up to date');
db.close();
