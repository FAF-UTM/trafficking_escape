-- Existing app_user table with improved column naming for passwords
CREATE TABLE app_user (
                          id SERIAL PRIMARY KEY,
                          username VARCHAR(255) NOT NULL,
                          password VARCHAR(255) NOT NULL,
                          role VARCHAR(50) NOT NULL,
                          email VARCHAR(255) NOT NULL UNIQUE,
                          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP
);

-- Chats table: each chat is linked to one user (the owner)
CREATE TABLE chats (
                       id SERIAL PRIMARY KEY,
                       user_id INTEGER NOT NULL,  -- FK referencing app_user
                       chat_image_url VARCHAR(255),  -- URL or path for the chat image
                       chat_name VARCHAR(255) NOT NULL,  -- name or title of the chat
                       is_trafficker BOOLEAN NOT NULL DEFAULT FALSE,  -- flag for trafficking status
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP,
                       CONSTRAINT fk_chats_user
                           FOREIGN KEY (user_id)
                               REFERENCES app_user(id)
                               ON DELETE CASCADE
);

-- Messages table: each message is linked to one chat
CREATE TABLE messages (
                          id SERIAL PRIMARY KEY,
                          chat_id INTEGER NOT NULL,  -- FK referencing chats
                          is_outgoing BOOLEAN NOT NULL,  -- true if the message is sent by the logged-in user
                          message_text TEXT NOT NULL,  -- content of the message
                          sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          CONSTRAINT fk_messages_chat
                              FOREIGN KEY (chat_id)
                                  REFERENCES chats(id)
                                  ON DELETE CASCADE
);
