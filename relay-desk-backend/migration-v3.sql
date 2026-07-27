-- ============================================================
--  Relay Desk — Migration v3 (non-destructive)
--  Safe to re-run. Does NOT drop the database or existing data.
-- ============================================================

USE relay_desk;

-- ---------- helper macro pattern: add column only if missing ----------

-- 1. branches: manual branch number + enable/disable
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='relay_desk' AND TABLE_NAME='branches' AND COLUMN_NAME='manual_number');
SET @sql := IF(@c=0, 'ALTER TABLE branches ADD COLUMN manual_number VARCHAR(30) NULL AFTER location', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='relay_desk' AND TABLE_NAME='branches' AND COLUMN_NAME='status');
SET @sql := IF(@c=0, "ALTER TABLE branches ADD COLUMN status ENUM('enabled','disabled') NOT NULL DEFAULT 'enabled'", 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 2. agents: department assignment + per-user status-change permission
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='relay_desk' AND TABLE_NAME='agents' AND COLUMN_NAME='department_id');
SET @sql := IF(@c=0, 'ALTER TABLE agents ADD COLUMN department_id INT NULL AFTER branch_id', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='relay_desk' AND TABLE_NAME='agents' AND COLUMN_NAME='can_change_status');
SET @sql := IF(@c=0, 'ALTER TABLE agents ADD COLUMN can_change_status TINYINT(1) NOT NULL DEFAULT 1', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='relay_desk' AND TABLE_NAME='agents' AND COLUMN_NAME='branch_number');
SET @sql := IF(@c=0, 'ALTER TABLE agents ADD COLUMN branch_number VARCHAR(30) NULL', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 3. tickets: requester name (free text), direct branch_id, customer_id now optional
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='relay_desk' AND TABLE_NAME='tickets' AND COLUMN_NAME='requester_name');
SET @sql := IF(@c=0, 'ALTER TABLE tickets ADD COLUMN requester_name VARCHAR(160) NULL AFTER subject', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='relay_desk' AND TABLE_NAME='tickets' AND COLUMN_NAME='branch_id');
SET @sql := IF(@c=0, 'ALTER TABLE tickets ADD COLUMN branch_id INT NULL AFTER department_id', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- customer_id becomes optional (walk-in / phone tickets don't need a customer account)
ALTER TABLE tickets MODIFY COLUMN customer_id INT NULL;

-- 4. Ticket transfer workflow (request → accept/reject)
CREATE TABLE IF NOT EXISTS ticket_transfers (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id           INT NOT NULL,
  from_department_id  INT NULL,
  to_department_id    INT NOT NULL,
  requested_by        INT NULL,
  status              ENUM('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at         DATETIME NULL,
  CONSTRAINT fk_transfer_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  CONSTRAINT fk_transfer_from FOREIGN KEY (from_department_id) REFERENCES departments(id) ON DELETE SET NULL,
  CONSTRAINT fk_transfer_to FOREIGN KEY (to_department_id) REFERENCES departments(id) ON DELETE CASCADE,
  CONSTRAINT fk_transfer_agent FOREIGN KEY (requested_by) REFERENCES agents(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Detailed activity timeline (replaces the generic "System: attachment uploaded" log)
CREATE TABLE IF NOT EXISTS ticket_activity (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id     INT NOT NULL,
  action_type   VARCHAR(40) NOT NULL, -- created, status_changed, department_assigned, department_transferred, remark_added, attachment_uploaded
  description   TEXT,
  performed_by  VARCHAR(120),
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET @c := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA='relay_desk' AND TABLE_NAME='ticket_activity' AND INDEX_NAME='idx_activity_ticket');
SET @sql := IF(@c=0, 'CREATE INDEX idx_activity_ticket ON ticket_activity(ticket_id)', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 6. Internal remark visibility toggles (Admin-controlled, app-wide)
INSERT INTO app_settings (setting_key, setting_value) VALUES
  ('remark_visible_to_customer', 'false'),
  ('remark_visible_to_dealer', 'true')
ON DUPLICATE KEY UPDATE setting_key = setting_key;

-- 7. Add "Branch" as a routable department option (Branch-type tickets)
INSERT INTO departments (name, email)
SELECT 'Branch', 'branch@gclbroking.com'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Branch');

SELECT 'Migration v3 complete.' AS status;
