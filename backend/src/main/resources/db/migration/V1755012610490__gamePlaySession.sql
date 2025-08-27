CREATE TABLE game_play_sessions (
    id SERIAL PRIMARY KEY,
    game_name VARCHAR(100) NOT NULL,
    total_seconds INTEGER NOT NULL,
    played_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_game_play_sessions_played_at ON game_play_sessions(played_at);

