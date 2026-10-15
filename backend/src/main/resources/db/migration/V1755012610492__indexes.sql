-- Foreign keys are not indexed automatically in PostgreSQL; these back the most frequent lookups.
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats (user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id_sent_at ON messages (chat_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_app_user_username ON app_user (username);
CREATE INDEX IF NOT EXISTS idx_app_user_created_by ON app_user (created_by);
