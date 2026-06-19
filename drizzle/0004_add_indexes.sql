-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_scripts_user_game ON scripts (user_id, game_id);
CREATE INDEX IF NOT EXISTS idx_scripts_game_active ON scripts (game_id, is_active_entry);
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches (tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_script_a ON matches (script_a_id);
CREATE INDEX IF NOT EXISTS idx_matches_script_b ON matches (script_b_id);
CREATE INDEX IF NOT EXISTS idx_matches_game_type ON matches (game_id, match_type);
