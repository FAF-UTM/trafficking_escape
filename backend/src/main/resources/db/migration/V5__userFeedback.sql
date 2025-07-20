CREATE TABLE feedback (
                          id SERIAL PRIMARY KEY,
                          experience INTEGER,
                          difficulty INTEGER,
                          awareness INTEGER,
                          minigames INTEGER,
                          recommend INTEGER,
                          navigation INTEGER,
                          created_at TIMESTAMP NOT NULL
);