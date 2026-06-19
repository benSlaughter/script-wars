import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
import { join, dirname } from 'path';
import { mkdirSync } from 'fs';

const DB_PATH = process.env.DATABASE_URL ?? join(process.cwd(), 'data', 'script-wars.db');

// Ensure the directory exists
mkdirSync(dirname(DB_PATH), { recursive: true });

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
