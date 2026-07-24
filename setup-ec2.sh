#!/bin/bash
# ============================================================
#  Relay Desk — EC2 Server Setup Script
#  Tested on: Ubuntu 22.04 / 24.04 LTS (AWS EC2)
#
#  Installs:
#    - Node.js 20.x LTS   (matches this project — Vite 5,
#      Express 4, ESM imports all require Node 18+; 20.x LTS
#      is the recommended stable version)
#    - MySQL Server 8.x   (root / root as requested)
#    - PM2                (keeps the Node backend running as
#      a background service, auto-restarts on crash/reboot)
#    - Git, build tools, unzip
#
#  Usage:
#    chmod +x setup-ec2.sh
#    sudo ./setup-ec2.sh
# ============================================================

set -e  # stop immediately if any command fails

echo "============================================"
echo "  Relay Desk — EC2 Environment Setup"
echo "============================================"

# ------------------------------------------------------------
# 1. System update
# ------------------------------------------------------------
echo ""
echo "[1/7] Updating system packages..."
apt-get update -y
apt-get upgrade -y

# ------------------------------------------------------------
# 2. Basic tools
# ------------------------------------------------------------
echo ""
echo "[2/7] Installing git, build-essential, unzip, curl..."
apt-get install -y git curl unzip build-essential

# ------------------------------------------------------------
# 3. Node.js 20.x LTS  (via NodeSource — official repo)
# ------------------------------------------------------------
echo ""
echo "[3/7] Installing Node.js 20.x LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo "Node.js version: $(node -v)"
echo "npm version:     $(npm -v)"

# ------------------------------------------------------------
# 4. PM2 (process manager to keep the backend running)
# ------------------------------------------------------------
echo ""
echo "[4/7] Installing PM2 globally..."
npm install -g pm2

# ------------------------------------------------------------
# 5. MySQL Server 8.x
# ------------------------------------------------------------
echo ""
echo "[5/7] Installing MySQL Server..."

# Pre-set the root password non-interactively (avoids the
# interactive prompt during install)
MYSQL_ROOT_PASSWORD="root"
export DEBIAN_FRONTEND=noninteractive
debconf-set-selections <<< "mysql-server mysql-server/root_password password ${MYSQL_ROOT_PASSWORD}"
debconf-set-selections <<< "mysql-server mysql-server/root_password_again password ${MYSQL_ROOT_PASSWORD}"

apt-get install -y mysql-server

# Ensure MySQL is running
systemctl enable mysql
systemctl start mysql

echo ""
echo "[5/7] Configuring MySQL root user for password login..."
# Ubuntu's MySQL defaults root to socket auth (no password needed
# locally as the linux root user) — switch it to a real password
# so the app's .env DB_PASSWORD=root actually works.
mysql --user=root <<-EOSQL
  ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASSWORD}';
  FLUSH PRIVILEGES;
EOSQL

echo "MySQL root password set to: ${MYSQL_ROOT_PASSWORD}"

# ------------------------------------------------------------
# 6. Firewall — open the ports this project needs
# ------------------------------------------------------------
echo ""
echo "[6/7] Configuring firewall (ufw)..."
if command -v ufw >/dev/null 2>&1; then
  ufw allow OpenSSH
  ufw allow 5000/tcp   # backend API
  ufw allow 5173/tcp   # frontend dev server (remove once behind nginx)
  ufw allow 80/tcp     # nginx / production frontend
  ufw allow 443/tcp    # HTTPS
  ufw --force enable
else
  echo "ufw not found — skipping firewall config. Configure your EC2 Security Group instead:"
  echo "  Inbound rules needed: 22 (SSH), 80 (HTTP), 443 (HTTPS), 5000 (API), 5173 (dev, optional)"
fi

# ------------------------------------------------------------
# 7. Done — summary + next steps
# ------------------------------------------------------------
echo ""
echo "[7/7] Done!"
echo ""
echo "============================================"
echo "  Setup complete"
echo "============================================"
echo "Node.js  : $(node -v)"
echo "npm      : $(npm -v)"
echo "MySQL    : $(mysql --version)"
echo "PM2      : $(pm2 -v)"
echo ""
echo "MySQL credentials:"
echo "  Host     : localhost"
echo "  Port     : 3306"
echo "  User     : root"
echo "  Password : root"
echo ""
echo "============================================"
echo "  Next steps"
echo "============================================"
echo "1. Clone your project:"
echo "     git clone https://github.com/techwithburhan/Relay-Desk.git"
echo ""
echo "2. Set up the database:"
echo "     cd Relay-Desk/relay-desk-backend"
echo "     mysql -u root -proot < schema.sql"
echo ""
echo "3. Configure .env (DB_HOST=localhost, DB_USER=root, DB_PASSWORD=root)"
echo ""
echo "4. Install dependencies and start the backend with PM2:"
echo "     npm install"
echo "     pm2 start server.js --name relay-desk-backend"
echo "     pm2 save"
echo "     pm2 startup   # then run the command it prints, to survive reboots"
echo ""
echo "5. Build and serve the frontend:"
echo "     cd ../relay-desk-dashboard"
echo "     npm install"
echo "     npm run build"
echo "     # serve the dist/ folder with nginx, or:"
echo "     npm install -g serve"
echo "     pm2 start \"serve -s dist -l 5173\" --name relay-desk-frontend"
echo "     pm2 save"
echo "============================================"
