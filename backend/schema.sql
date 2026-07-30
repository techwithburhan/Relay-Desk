-- ============================================
-- Relay Desk — MySQL schema
-- Run this once against your MySQL server:
--   mysql -u root -p < schema.sql
--
-- NOTE: this DROPS and recreates the "relay_desk" database every time it
-- runs, so it's always safe to re-run after a failed or partial setup.
-- If you have real data in this database already, back it up first.
-- ============================================

DROP DATABASE IF EXISTS relay_desk;

CREATE DATABASE relay_desk
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE relay_desk;

-- ---------- Branches (locations — Delhi, Mumbai, etc.) ----------
CREATE TABLE IF NOT EXISTS branches (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(120) NOT NULL,
  location       VARCHAR(120) NOT NULL,
  manual_number  VARCHAR(30),
  status         ENUM('enabled','disabled') NOT NULL DEFAULT 'enabled',
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------- Agents (support staff / login users) ----------
CREATE TABLE IF NOT EXISTS agents (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(120) NOT NULL,
  email             VARCHAR(160) NOT NULL UNIQUE,
  password_hash     VARCHAR(255) NOT NULL,
  role              ENUM('admin','dealer','client') NOT NULL DEFAULT 'dealer',
  branch_id         INT NULL,       -- NULL for admins (they aren't tied to one branch)
  department_id     INT NULL,       -- which department this user handles tickets for
  branch_number     VARCHAR(30),    -- manual branch number, set by Admin
  customer_id       INT NULL,       -- only set for role='client': which client record this login represents
  active            TINYINT(1) NOT NULL DEFAULT 1,  -- Dealer Mapping: Allow Login / Disable Login
  can_change_status TINYINT(1) NOT NULL DEFAULT 1,  -- User Management: per-user status-change permission
  last_login_at     DATETIME NULL,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_agents_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------- Customers / Clients ----------
CREATE TABLE IF NOT EXISTS customers (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  client_code       VARCHAR(30) NOT NULL UNIQUE,  -- e.g. "DEL-1042"
  name              VARCHAR(120) NOT NULL,
  email             VARCHAR(160) NOT NULL UNIQUE,
  company           VARCHAR(160),
  mobile            VARCHAR(20),
  pan               VARCHAR(15),
  branch_id         INT NOT NULL,
  dealer_agent_id   INT NULL,          -- which dealer (agents.id) manages this client
  status            ENUM('active','inactive') NOT NULL DEFAULT 'active',
  city              VARCHAR(80),
  state             VARCHAR(80),
  last_login_at     DATETIME NULL,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_customers_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT,
  CONSTRAINT fk_customers_dealer FOREIGN KEY (dealer_agent_id) REFERENCES agents(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_customers_branch ON customers(branch_id);

ALTER TABLE agents
  ADD CONSTRAINT fk_agents_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

-- ---------- Departments (point 12: department-wise ticket routing) ----------
CREATE TABLE IF NOT EXISTS departments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120) NOT NULL UNIQUE,
  email      VARCHAR(160) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

ALTER TABLE agents
  ADD CONSTRAINT fk_agents_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- ---------- Notifications (point 3: global notification center) ----------
CREATE TABLE IF NOT EXISTS notifications (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  agent_id    INT NULL,        -- NULL = broadcast to every logged-in role listed in target_roles
  target_roles VARCHAR(60) NULL, -- comma list e.g. 'admin,dealer' — used only when agent_id is NULL
  type        VARCHAR(40) NOT NULL,  -- 'ticket_reply','ticket_status','report','software_upload','license','system'
  title       VARCHAR(160) NOT NULL,
  body        VARCHAR(255),
  link_url    VARCHAR(255),
  is_read     TINYINT(1) NOT NULL DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_agent FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_notifications_agent ON notifications(agent_id);

-- ---------- Access logs (point 8 & 14: login activity for Admin export) ----------
CREATE TABLE IF NOT EXISTS access_logs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  agent_id    INT NULL,
  agent_email VARCHAR(160) NOT NULL,
  agent_role  VARCHAR(20) NOT NULL,
  action      VARCHAR(40) NOT NULL,   -- 'login', 'login_failed', 'logout', 'session_timeout'
  ip_address  VARCHAR(64),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_logs_agent FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_logs_created ON access_logs(created_at);

-- ---------- App-wide settings (point 12 branding, point 7 dashboard toggle) ----------
-- Simple key/value store so new settings can be added without new columns/tables.
CREATE TABLE IF NOT EXISTS app_settings (
  setting_key   VARCHAR(80) PRIMARY KEY,
  setting_value TEXT,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------- Downloads (point 9: Essential Downloads / Software Downloads) ----------
CREATE TABLE IF NOT EXISTS downloads (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(160) NOT NULL,
  description  TEXT,
  category     VARCHAR(80) NOT NULL,      -- 'Essential Downloads', 'Software Downloads', or custom
  file_type    ENUM('pdf','exe','zip','doc','docx','xls','xlsx','ppt','png','jpg') NOT NULL,
  file_url     LONGTEXT NOT NULL,          -- external URL or an uploaded file as a data: URI
  icon         VARCHAR(40),                -- optional override icon key; falls back to file_type icon
  status       ENUM('enabled','disabled') NOT NULL DEFAULT 'enabled',
  visible_to   VARCHAR(80) NOT NULL DEFAULT 'admin,dealer,client', -- comma list of roles
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------- Login page slider (point 6: max 4 slides, admin managed) ----------
CREATE TABLE IF NOT EXISTS login_slides (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  image_url         LONGTEXT,   -- large background image, uploaded as a data: URI or an external URL
  product_image_url LONGTEXT,   -- small product image / logo / icon, shown on top of the background
  title             VARCHAR(160),
  subtitle          VARCHAR(160),
  description       TEXT,
  button_text       VARCHAR(80),
  button_url        VARCHAR(255),
  sort_order        INT NOT NULL DEFAULT 0,
  status            ENUM('enabled','disabled') NOT NULL DEFAULT 'enabled',
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------- License management (point 8: 30-day activation) ----------
CREATE TABLE IF NOT EXISTS licenses (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  license_key  VARCHAR(64) NOT NULL UNIQUE,
  status       ENUM('active','revoked','expired') NOT NULL DEFAULT 'active',
  issued_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at   DATETIME NOT NULL,
  created_by   INT NULL,
  CONSTRAINT fk_license_agent FOREIGN KEY (created_by) REFERENCES agents(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------- Password resets (point 9: Forgot Password) ----------
CREATE TABLE IF NOT EXISTS password_resets (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  agent_id   INT NOT NULL,
  token      VARCHAR(128) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used       TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reset_agent FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- Tickets ----------
CREATE TABLE IF NOT EXISTS tickets (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  ticket_number     VARCHAR(20) NOT NULL UNIQUE,   -- e.g. "T-98051"
  subject           VARCHAR(255) NOT NULL,
  requester_name    VARCHAR(160),   -- free-text name entered on the ticket form (no customer account required)
  description       TEXT,
  remark            TEXT,  -- internal admin/dealer notes, not shown to the customer
  category          VARCHAR(80),
  priority          ENUM('Low','Medium','High','Urgent','Critical') NOT NULL DEFAULT 'Medium',
  status            ENUM('Open','Assigned','In Progress','Pending','Resolved','Closed','Reopened') NOT NULL DEFAULT 'Open',
  customer_id       INT NULL,   -- optional: only set when raised by/for a real customer account
  assigned_agent_id INT NULL,
  department_id     INT NULL,  -- which department this ticket is routed to (drives visibility)
  branch_id         INT NULL,  -- set directly when Department = "Branch" (independent of customer_id)
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tickets_customer   FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  CONSTRAINT fk_tickets_agent      FOREIGN KEY (assigned_agent_id) REFERENCES agents(id) ON DELETE SET NULL,
  CONSTRAINT fk_tickets_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  CONSTRAINT fk_tickets_branch     FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_tickets_status     ON tickets(status);
CREATE INDEX idx_tickets_priority   ON tickets(priority);
CREATE INDEX idx_tickets_agent      ON tickets(assigned_agent_id);
CREATE INDEX idx_tickets_department ON tickets(department_id);

-- ---------- Ticket transfer workflow (request → accept/reject) ----------
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

-- ---------- Detailed activity timeline ----------
CREATE TABLE IF NOT EXISTS ticket_activity (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id     INT NOT NULL,
  action_type   VARCHAR(40) NOT NULL,
  description   TEXT,
  performed_by  VARCHAR(120),
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_activity_ticket ON ticket_activity(ticket_id);

-- ---------- Comments (ticket activity/replies — point 15: threaded conversation) ----------
CREATE TABLE IF NOT EXISTS comments (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id      INT NOT NULL,
  author_name    VARCHAR(120) NOT NULL,
  author_type    ENUM('customer','agent','department','internal_note','system') NOT NULL DEFAULT 'agent',
  body           TEXT NOT NULL,
  attachment_url LONGTEXT,     -- optional file attached to this reply (data: URI or external URL)
  attachment_name VARCHAR(160),
  is_read        TINYINT(1) NOT NULL DEFAULT 0,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comments_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_comments_ticket ON comments(ticket_id);

-- ---------- Knowledge Base articles ----------
CREATE TABLE IF NOT EXISTS knowledge_base_articles (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(255) NOT NULL,
  category   VARCHAR(80) NOT NULL,
  content    TEXT,
  url        VARCHAR(255),  -- "Read More" link
  views      INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- Seed data (matches the sample data used in the React frontend)
-- Password for all seeded agents is: password123
-- ============================================

INSERT INTO branches (name, location, manual_number, status) VALUES
('Relay Desk — Delhi',   'Delhi',   'BR-001', 'enabled'),
('Relay Desk — Mumbai',  'Mumbai',  'BR-002', 'enabled'),
('Relay Desk — Pune',    'Pune',    'BR-003', 'enabled');

-- ---------- Departments (point 12) — "Branch" is a routable pseudo-department too ----------
INSERT INTO departments (name, email) VALUES
('Branch',                       'branch@gclbroking.com'),
('Account Opening / KYC',        'accountopening@gclbroking.com'),
('Trading / Dealing Desk',       'trading@gclbroking.com'),
('Back Office / Settlement',     'backoffice@gclbroking.com'),
('Risk Management / Margin',     'risk@gclbroking.com'),
('Demat / DP Operations',        'demat@gclbroking.com'),
('Finance / Payments',           'finance@gclbroking.com'),
('IT / Technical Support',       'it@gclbroking.com'),
('Compliance / Legal',           'compliance@gclbroking.com'),
('Customer Support / RM',        'support@gclbroking.com'),
('Research / Advisory',          'research@gclbroking.com'),
('Mutual Fund / Insurance',      'mutualfund@gclbroking.com'),
('Sales / Dealer Onboarding',    'sales@gclbroking.com'),
('HR / Admin',                   'hr@gclbroking.com');

-- Admin has branch_id = NULL → sees every branch.
-- Dealers each belong to exactly one branch.
-- Client logins are tied to one customer_id → they only ever see their own tickets.
INSERT INTO agents (name, email, password_hash, role, branch_id, customer_id) VALUES
('Burhan',      'burhan@gclbroking.com',     '$2a$10$rj8iL5FPNAnkWZFlwabWkO.rSV6FuSLaCiidTAFuTtHxIFjewyFVO', 'admin',  NULL, NULL),
('Atul',        'atul@gclbroking.com',       '$2a$10$rj8iL5FPNAnkWZFlwabWkO.rSV6FuSLaCiidTAFuTtHxIFjewyFVO', 'dealer', 1,    NULL),
('Priya Menon', 'priya.menon@relaydesk.com', '$2a$10$rj8iL5FPNAnkWZFlwabWkO.rSV6FuSLaCiidTAFuTtHxIFjewyFVO', 'admin',  NULL, NULL),
('John D.',     'john.d@relaydesk.com',      '$2a$10$rj8iL5FPNAnkWZFlwabWkO.rSV6FuSLaCiidTAFuTtHxIFjewyFVO', 'dealer', 1,    NULL),
('Lisa M.',     'lisa.m@relaydesk.com',      '$2a$10$rj8iL5FPNAnkWZFlwabWkO.rSV6FuSLaCiidTAFuTtHxIFjewyFVO', 'dealer', 2,    NULL),
('Oihn D.',     'oihn.d@relaydesk.com',      '$2a$10$rj8iL5FPNAnkWZFlwabWkO.rSV6FuSLaCiidTAFuTtHxIFjewyFVO', 'dealer', 1,    NULL),
('Mike P.',     'mike.p@relaydesk.com',      '$2a$10$rj8iL5FPNAnkWZFlwabWkO.rSV6FuSLaCiidTAFuTtHxIFjewyFVO', 'dealer', 3,    NULL);

-- All seeded agents can log in with password: password123

-- client_code prefix maps to branch: DEL- = Delhi, MUM- = Mumbai, PUN- = Pune
-- dealer_agent_id references the dealer agents seeded above (2=Atul, 4=John D., 5=Lisa M., 6=Oihn D., 7=Mike P.)
INSERT INTO customers (client_code, name, email, company, mobile, pan, branch_id, dealer_agent_id, status, city, state) VALUES
('DEL-1001', 'Alex R.',  'alex.r@brightwave.io',  'Brightwave',  '9810011001', 'ABCPA1234A', 1, 2, 'active', 'New Delhi', 'Delhi'),
('MUM-2001', 'Sarah T.', 'sarah.t@meridian.co',   'Meridian Co', '9820022002', 'BXYPT5678B', 2, 5, 'active', 'Mumbai',    'Maharashtra'),
('DEL-1002', 'Maria G.', 'maria.g@nordline.com',  'Nordline',    '9810011002', 'CDEPN4321C', 1, 4, 'active', 'New Delhi', 'Delhi'),
('PUN-3001', 'Devon K.', 'devon.k@fluxbase.dev',  'Fluxbase',    '9830033003', 'DFGPK8765D', 3, 7, 'active', 'Pune',      'Maharashtra'),
('DEL-1003', 'Priya N.', 'priya.n@orbitalhq.com', 'Orbital HQ',  '9810011003', 'EFHPO2468E', 1, 6, 'active', 'New Delhi', 'Delhi'),
('DEL-1004', 'GCL IT',   'it@gclbroking.com',     'GCL Broking', '9810099099', 'GHIPB1122F', 1, 2, 'active', 'New Delhi', 'Delhi');

-- Third required login: it@gclbroking.com (role = client), linked to the
-- "GCL IT" customer record above — a client login only ever sees tickets
-- belonging to this one customer_id.
INSERT INTO agents (name, email, password_hash, role, branch_id, customer_id) VALUES
('GCL IT', 'it@gclbroking.com', '$2a$10$rj8iL5FPNAnkWZFlwabWkO.rSV6FuSLaCiidTAFuTtHxIFjewyFVO', 'client', 1,
  (SELECT id FROM customers WHERE email = 'it@gclbroking.com'));

-- department_id: 3=Back Office/Settlement, 6=Finance/Payments, 7=IT/Technical Support
INSERT INTO tickets (ticket_number, subject, description, priority, status, customer_id, assigned_agent_id, department_id) VALUES
('T-98051', 'Login issue after password reset', 'Customer reset their password via the email link but is now stuck on the login screen with a "session expired" error on every attempt.', 'High', 'In Progress', 1, 2, 7),
('T-98050', 'Feature request — dark mode', 'Customer is requesting a dark mode option for the dashboard, citing eye strain during long night shifts.', 'Medium', 'Open', 2, NULL, 7),
('T-98049', 'Billing error on renewal invoice', 'Customer was charged twice for their annual renewal. Needs a refund for the duplicate charge.', 'Urgent', 'Resolved', 3, 3, 6),
('T-98048', 'Data export stuck at 90%', 'Large CSV export job repeatedly stalls at 90% completion, requiring a manual retry.', 'Urgent', 'Resolved', 4, 4, 7),
('T-98047', 'Feature request — bulk tagging', 'Customer wants the ability to apply tags to multiple tickets at once instead of one at a time.', 'Medium', 'In Progress', 1, NULL, 7),
('T-98046', 'Cannot upload attachments', 'File attachments over 5MB fail silently when uploaded through the ticket reply box.', 'High', 'Open', 5, 2, 7),
('T-98045', 'API rate limit clarification', 'Customer asked for clarification on the current API rate limit tier for their plan.', 'Low', 'Resolved', 4, 3, 7),
('T-98044', 'Mobile app crashes on launch', 'App crashes immediately on launch for some Android users after the latest update.', 'Urgent', 'In Progress', 2, 5, 7),
('T-98052', 'Need help exporting margin report', 'Requesting a walkthrough on exporting the latest margin report for our records.', 'Medium', 'Open', 6, 2, 3);

INSERT INTO comments (ticket_id, author_name, author_type, body) VALUES
(1, 'Alex R.', 'customer', 'I reset my password like the email said, but I still can''t log in. It just says "session expired" every time.'),
(1, 'John D.', 'agent',    'Thanks for flagging this — checking your account now, can you tell me which browser you''re using?'),
(1, 'Alex R.', 'customer', 'Using Chrome on Windows, same issue on incognito mode too.'),
(2, 'Sarah T.', 'customer', 'Would love a dark mode option — our team works night shifts and the bright screen is rough after a while.'),
(3, 'Maria G.', 'customer', 'I was charged twice on my card for the annual renewal, can someone look into this?'),
(3, 'Lisa M.', 'agent',    'Sorry about that! I can see the duplicate charge — processing a refund now.'),
(3, 'Lisa M.', 'agent',    'Refund has been issued, should reflect on your statement in 3-5 business days.'),
(9, 'GCL IT', 'customer', 'Could someone walk me through exporting the latest margin report? Not finding the option.');

INSERT INTO knowledge_base_articles (title, category, content, url, views) VALUES
('Resetting a customer password', 'Account', 'Step-by-step guide for resetting a customer''s password from the admin panel.', 'https://help.example.com/reset-password', 1200),
('Understanding billing cycles', 'Billing', 'Explains how monthly and annual billing cycles are calculated.', 'https://help.example.com/billing-cycles', 860),
('Troubleshooting failed data exports', 'Product', 'Common causes of export failures and how to resolve them.', 'https://help.example.com/export-issues', 640),
('How to escalate an urgent ticket', 'Process', 'When and how to escalate a ticket to a team lead.', 'https://help.example.com/escalation', 410),
('Setting up SSO for your workspace', 'Security', 'Guide for configuring single sign-on for a workspace.', 'https://help.example.com/sso-setup', 295),
('API rate limits explained', 'Developers', 'Details on rate limit tiers by plan.', 'https://help.example.com/rate-limits', 188);

-- ---------- Default app settings (point 7, 12) ----------
INSERT INTO app_settings (setting_key, setting_value) VALUES
('branding_logo_url', ''),                 -- empty = use default "R" mark everywhere
('branding_portal_name', 'Relay Desk'),
('dashboard_tickets_enabled', 'true'),      -- Settings toggle: show/hide all tickets on dashboard
('session_timeout_minutes', '10'),          -- point 8: default 10-minute session
('staging_splash_image_url', ''),          -- point 15: optional splash PNG for the staging flow
('forgot_password_enabled', 'true'),        -- Admin toggle: show/hide + enable/disable the Forgot Password page
('remark_visible_to_customer', 'false'),    -- Internal Remark visibility toggle — Customer
('remark_visible_to_dealer', 'true');       -- Internal Remark visibility toggle — Dealer

-- ---------- Essential / Software Downloads (point 5, 9) ----------
INSERT INTO downloads (title, description, category, file_type, file_url, status, visible_to, sort_order) VALUES
('Margin Download',      'Latest margin report for your account.',        'Essential Downloads', 'pdf', '/downloads/margin-download.pdf',     'enabled', 'admin,dealer,client', 1),
('MTF Eligible Stock',   'List of stocks eligible for MTF.',              'Essential Downloads', 'pdf', '/downloads/mtf-eligible-stock.pdf',   'enabled', 'admin,dealer,client', 2),
('Odd Lot',              'Odd lot shares reference document.',            'Essential Downloads', 'pdf', '/downloads/odd-lot.pdf',              'enabled', 'admin,dealer,client', 3),
('GCL Returns Software', 'Desktop application for filing returns.',       'Software Downloads',  'exe', '/downloads/gcl-returns-software.exe', 'enabled', 'admin,dealer,client', 1);

-- ---------- Login slider (point 6) — starts with 1 default slide, max 4 total ----------
INSERT INTO login_slides (image_url, title, subtitle, description, sort_order, status) VALUES
(NULL, 'Relay Desk Support Console', 'Now Generally Available', 'Manage every ticket, client, and branch fast, easy, and at scale.', 1, 'enabled');

-- ---------- Default license (point 8) — 30-day validity starting now ----------
INSERT INTO licenses (license_key, status, expires_at) VALUES
('RELAY-DESK-DEMO-0001', 'active', DATE_ADD(NOW(), INTERVAL 30 DAY));

-- ---------- Sample notifications (point 3: global notification center) ----------
INSERT INTO notifications (agent_id, target_roles, type, title, body, link_url) VALUES
(NULL, 'admin,dealer', 'ticket_reply', 'New Ticket Reply', 'Ticket #T-98051 was updated', '/tickets/T-98051'),
(NULL, 'admin,dealer,client', 'software_upload', 'New Software Uploaded', 'Trading Terminal v2.4 is now available', '/downloads'),
(NULL, 'admin', 'license', 'License Active', 'Your license is valid for 30 days', '/admin/license');
