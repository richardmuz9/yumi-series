#!/bin/bash
# 🚀 Yumi Website Builder - DigitalOcean Deployment Script

echo "🌟 Setting up Yumi Website Builder Backend on DigitalOcean"
echo "======================================================================="

# 1. System Updates
echo "📦 Updating system packages..."
apt-get update && apt-get upgrade -y

# 2. Install Node.js 18
echo "🟢 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 3. Install nginx, certbot, and other dependencies
echo "🌐 Installing nginx, certbot, and other dependencies..."
apt-get install -y nginx certbot python3-certbot-nginx sqlite3 openssl

# 4. Install PM2 globally
echo "⚙️ Installing PM2 process manager..."
npm install -g pm2

# 5. Create application directory
echo "📁 Creating application directory..."
mkdir -p /opt/yumi-backend
cd /opt/yumi-backend

# 6. Copy backend files (you should have uploaded them first)
echo "📂 Setting up backend files..."
# Note: You need to upload the backend files first using scp or git clone

# 7. Install dependencies and build
echo "🔨 Installing dependencies and building..."
npm ci
npm run build

# 8. Create environment file
echo "🔧 Creating environment file..."
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
DATABASE_URL="file:/opt/yumi-backend/data/database.sqlite"

# Your domain configuration
YOUR_DOMAIN=https://yumi77965.online
FRONTEND_URL=https://yumi77965.online
API_URL=http://${137.184.89.215}
BACKEND_URL=http://${137.184.89.215}

# CORS Configuration
CORS_ORIGINS=https://yumi77965.online,http://localhost:5173,http://localhost:3000

# Add your API keys and other sensitive data here
JWT_SECRET=your-super-secret-jwt-key-change-this
QWEN_API_KEY=your-qwen-api-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Optional: Proxy Configuration
# PROXY_HOST=127.0.0.1
# PROXY_PORT=7890
EOF

echo "⚠️ IMPORTANT: Edit /opt/yumi-backend/.env with your actual API keys!"

# 9. Create data directory for SQLite
echo "📊 Setting up database directory..."
mkdir -p /opt/yumi-backend/data
chown -R $USER:$USER /opt/yumi-backend/data
chmod 755 /opt/yumi-backend/data

# 10. Setup nginx configuration
echo "🌐 Creating nginx configuration..."
cat > /etc/nginx/sites-available/yumi-backend << EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${137.184.89.215};

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
EOF

# 11. Enable nginx site
echo "🔗 Enabling nginx site..."
ln -s /etc/nginx/sites-available/yumi-backend /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default  # Remove default site
nginx -t && systemctl reload nginx

# 12. Setup PM2 for process management
echo "🔄 Setting up PM2 process management..."
cd /opt/yumi-backend
pm2 start dist/index.js --name "yumi-backend"
pm2 startup
pm2 save

# 13. Run database migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

echo ""
echo "🎉 Setup complete!"
echo "======================================================================="
echo "✅ Backend API is now running on: http://${137.184.89.215}"
echo "✅ Health check: http://${137.184.89.215}/health"
echo ""
echo "🔧 Next steps:"
echo "1. Edit /opt/yumi-backend/.env with your actual API keys"
echo "2. Update your frontend configuration to point to this backend"
echo "3. Test the full application"
echo ""
echo "📋 Useful commands:"
echo "- View backend logs: pm2 logs yumi-backend"
echo "- Restart backend: pm2 restart yumi-backend"
echo "- Check nginx status: systemctl status nginx"
echo "- View nginx logs: tail -f /var/log/nginx/error.log"
echo "- Monitor backend: pm2 monit" 