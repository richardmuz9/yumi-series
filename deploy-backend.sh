#!/bin/bash

# Zip the backend files
echo "📦 Zipping backend files..."
cd backend
zip -r ../backend.zip ./*

# Copy files to DigitalOcean
echo "📤 Copying files to DigitalOcean..."
scp ../backend.zip root@137.184.89.215:/opt/yumi-backend/

# SSH into the droplet and set up the application
echo "🚀 Setting up the application..."
ssh root@137.184.89.215 << 'EOF'
cd /opt/yumi-backend
unzip -o backend.zip
rm backend.zip

# Install dependencies and build
npm ci
npm run build

# Start with PM2
pm2 delete yumi-backend || true
pm2 start dist/index.js --name yumi-backend
pm2 save

# Show status
pm2 status
echo ""
echo "✅ Deployment completed!"
echo "Check the API: curl http://137.184.89.215/api/health"
EOF 