-- Add gameId column to scripts, tournaments, and matches tables
ALTER TABLE `scripts` ADD COLUMN `game_id` text NOT NULL DEFAULT 'rps';
ALTER TABLE `tournaments` ADD COLUMN `game_id` text NOT NULL DEFAULT 'rps';
ALTER TABLE `matches` ADD COLUMN `game_id` text NOT NULL DEFAULT 'rps';
