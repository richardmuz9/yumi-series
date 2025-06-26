#!/bin/bash

# Update system packages
apt-get update && apt-get upgrade -y

# Install required packages
apt-get install -y nginx certbot python3-certbot-nginx ufw

# Configure firewall
ufw allow 22/tcp  # SSH
ufw allow 80/tcp  # HTTP
ufw allow 443/tcp # HTTPS
ufw allow 3001/tcp # Node.js application
ufw --force enable

# Create nginx configuration
cat > /etc/nginx/sites-available/yumi-backend << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name 137.184.89.215;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://localhost:3001/api/health;
        access_log off;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/yumi-backend /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Reload nginx
systemctl reload nginx

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Create application directory
mkdir -p /opt/yumi-backend
cd /opt/yumi-backend

echo "✅ Setup completed!"
echo "Next steps:"
echo "1. Copy your backend files to /opt/yumi-backend/"
echo "2. Install dependencies: cd /opt/yumi-backend && npm ci"
echo "3. Build the application: npm run build"
echo "4. Start with PM2: pm2 start dist/index.js --name yumi-backend"
echo ""
echo "To check status:"
echo "- nginx status: systemctl status nginx"
echo "- PM2 status: pm2 status"
echo "- Logs: pm2 logs yumi-backend"
echo ""
echo "Test your API:"
echo "curl http://137.184.89.215/api/health" 