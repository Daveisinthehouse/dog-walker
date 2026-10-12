CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL CHECK (length(player_name) BETWEEN 1 AND 20),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10000000),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS scores_leaderboard_idx
ON scores (score DESC, created_at ASC);
