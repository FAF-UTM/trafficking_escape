ALTER TABLE app_user ADD COLUMN access_code_hash VARCHAR(200);
ALTER TABLE app_user ADD COLUMN access_code_sha256 CHAR(64);
CREATE UNIQUE INDEX ux_app_user_code_sha256 ON app_user(access_code_sha256);
