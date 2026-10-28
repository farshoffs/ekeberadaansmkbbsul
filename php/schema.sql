-- Run only AFTER importing eKeberadaan_SMKBBSL_mysql.sql into the selected database.
-- Additional PHP authentication storage; do not reuse legacy Google Apps Script hashes.
CREATE TABLE IF NOT EXISTS web_auth (
  email VARCHAR(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL PRIMARY KEY,
  pin_hash VARCHAR(255) NOT NULL,
  must_change_pin TINYINT(1) NOT NULL DEFAULT 0,
  attempts INT NOT NULL DEFAULT 0,
  locked_until DATETIME NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Upgrade an existing web_auth table created by an older version of schema.sql.
-- CREATE TABLE IF NOT EXISTS does not add columns to an existing table.
-- Dynamic SQL works on both MySQL and MariaDB without duplicate-column errors.
SET @ek_column_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'web_auth'
    AND COLUMN_NAME = 'must_change_pin'
);
SET @ek_column_upgrade := IF(
  @ek_column_exists = 0,
  'ALTER TABLE web_auth ADD COLUMN must_change_pin TINYINT(1) NOT NULL DEFAULT 0 AFTER pin_hash',
  'SELECT 1'
);
PREPARE ek_stmt FROM @ek_column_upgrade;
EXECUTE ek_stmt;
DEALLOCATE PREPARE ek_stmt;

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

-- One-time browser installer lock. It remains set after first admin activation.
CREATE TABLE IF NOT EXISTS web_setup_state (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  installed TINYINT(1) NOT NULL DEFAULT 0,
  installed_at DATETIME NULL,
  installed_by VARCHAR(128) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT IGNORE INTO web_setup_state (id, installed) VALUES (1, 0);
