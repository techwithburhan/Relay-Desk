-- ============================================================
--  Relay Desk — Migration v2 (non-destructive)
--  Safe to re-run: uses IF NOT EXISTS checks where possible.
--  This does NOT drop the database or any existing data.
-- ============================================================

USE relay_desk;

-- ---------- 1. Tickets: add an internal remark field ----------
-- (separate from customer-visible comments — admin/dealer notes only)
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'relay_desk' AND TABLE_NAME = 'tickets' AND COLUMN_NAME = 'remark'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE tickets ADD COLUMN remark TEXT NULL AFTER description',
  'SELECT "remark column already exists" AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---------- 2. Knowledge Base: add a "Read More" URL field ----------
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'relay_desk' AND TABLE_NAME = 'knowledge_base_articles' AND COLUMN_NAME = 'url'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE knowledge_base_articles ADD COLUMN url VARCHAR(255) NULL AFTER content',
  'SELECT "url column already exists" AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---------- 3. App settings: Forgot Password enable/disable toggle ----------
INSERT INTO app_settings (setting_key, setting_value)
VALUES ('forgot_password_enabled', 'true')
ON DUPLICATE KEY UPDATE setting_key = setting_key; -- no-op if it already exists

-- ---------- 4. Agents: allow deleting a user without breaking old tickets ----------
-- (assigned_agent_id already has ON DELETE SET NULL — nothing to change there,
--  this just documents that DELETE /api/agents/:id is now safe to use)

SELECT 'Migration v2 complete.' AS status;
