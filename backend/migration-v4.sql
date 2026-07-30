-- ============================================================
--  Relay Desk — Migration v4 (non-destructive)
--  Fixes existing Client logins that have no linked customer
--  record (this is what was causing "Client account has no
--  linked customer record" when they tried to create a ticket).
-- ============================================================

USE relay_desk;

-- Find every client-role agent with no customer_id, create a matching
-- customer record for each, and link it back.
-- (Run safely any number of times — agents that already have a
--  customer_id are skipped automatically.)

DROP TEMPORARY TABLE IF EXISTS _broken_clients;
CREATE TEMPORARY TABLE _broken_clients AS
SELECT id, name, email, branch_id
FROM agents
WHERE role = 'client' AND customer_id IS NULL;

-- For any broken client with no branch_id either, default to the
-- first branch so the backfill can still proceed.
UPDATE _broken_clients
SET branch_id = (SELECT id FROM branches ORDER BY id ASC LIMIT 1)
WHERE branch_id IS NULL;

-- Create one customer record per broken client login.
INSERT INTO customers (client_code, name, email, branch_id, status)
SELECT
  CONCAT('AUTO-', bc.branch_id, '-', bc.id),
  bc.name,
  bc.email,
  bc.branch_id,
  'active'
FROM _broken_clients bc
WHERE NOT EXISTS (SELECT 1 FROM customers c WHERE c.email = bc.email);

-- Link each fixed agent to their (now-existing) customer record.
UPDATE agents a
JOIN _broken_clients bc ON bc.id = a.id
JOIN customers c ON c.email = bc.email
SET a.customer_id = c.id, a.branch_id = COALESCE(a.branch_id, bc.branch_id)
WHERE a.role = 'client' AND a.customer_id IS NULL;

DROP TEMPORARY TABLE IF EXISTS _broken_clients;

SELECT 'Migration v4 complete — all Client logins now have a linked customer record.' AS status;
