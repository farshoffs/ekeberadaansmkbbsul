-- Run only AFTER importing eKeberadaan_SMKBBSL_mysql.sql into the selected database.
-- Additional PHP authentication storage; do not reuse legacy Google Apps Script hashes.
CREATE TABLE IF NOT EXISTS web_auth (
  email VARCHAR(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL PRIMARY KEY,
  pin_hash VARCHAR(255) NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  locked_until DATETIME NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS web_sessions (
  token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  email VARCHAR(128) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_web_sessions_email (email),
  INDEX idx_web_sessions_expire (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Imported workbook contains legacy sessions/password hashes; those cannot authenticate PHP.
-- This schema intentionally does NOT expose those records as live sessions.
