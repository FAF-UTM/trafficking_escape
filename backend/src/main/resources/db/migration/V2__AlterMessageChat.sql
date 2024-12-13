ALTER TABLE chat_messages
    ADD COLUMN id           SERIAL PRIMARY KEY,
    ADD COLUMN option1      VARCHAR(255),
    ADD COLUMN option2      VARCHAR(255),
    ADD COLUMN option3      VARCHAR(255);

ALTER TABLE chat_messages
    drop COLUMN message;

ALTER TABLE chat_data
    ADD COLUMN danger_level numeric(5);