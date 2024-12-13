CREATE TABLE app_user (
                          id SERIAL PRIMARY KEY,
                          username VARCHAR(255) NOT NULL,
                          password VARCHAR(255) NOT NULL,
                          role VARCHAR(50) NOT NULL,
                          email VARCHAR(255) NOT NULL UNIQUE,
                          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP
);
CREATE TABLE chat_users (
                            id SERIAL PRIMARY KEY,
                            img_src VARCHAR(255),
                            name VARCHAR(255),
                            message TEXT,
                            chat_id VARCHAR(255),
                            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP,
                            user_id BIGINT NOT NULL,
                            CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES app_user (id) ON DELETE CASCADE
);
CREATE TABLE chat_data (
                           id SERIAL PRIMARY KEY,
                           "from" VARCHAR(255),
                           from_img VARCHAR(255),
                           send_type VARCHAR(50),
                           created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           updated_at TIMESTAMP,
                           chat_user_id BIGINT NOT NULL,
                           CONSTRAINT fk_chat_user FOREIGN KEY (chat_user_id) REFERENCES chat_users (id) ON DELETE CASCADE
);
CREATE TABLE chat_messages (
                               chat_data_id BIGINT NOT NULL,
                               message TEXT NOT NULL,
                               CONSTRAINT fk_chat_data FOREIGN KEY (chat_data_id) REFERENCES chat_data (id) ON DELETE CASCADE
);
