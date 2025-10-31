#!/bin/bash

# Tez Dashboard - Quick Deploy Script
# Choose your deployment method by uncommenting the relevant section

echo "🚀 Tez Dashboard Deployment Script"
echo "==================================="
echo ""

# ============================================
# OPTION 1: Deploy to Vercel (RECOMMENDED)
# ============================================
# Uncomment the lines below to deploy to Vercel

# echo "📦 Deploying to Vercel..."
# vercel --prod

# ============================================
# OPTION 2: Build for Self-Hosting
# ============================================
# Uncomment to build for manual deployment

echo "🔨 Building production bundle..."
npm run build

echo ""
echo "✅ Build complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.production.local with your API URL"
echo "2. Deploy the .next folder to your server"
echo "3. Run 'npm start' on your server"
echo ""

# ============================================
# OPTION 3: Docker Build & Push
# ============================================
# Uncomment to build and push Docker image

# echo "🐳 Building Docker image..."
# docker build -t tez-dashboard:latest .
# 
# echo "📤 Pushing to registry..."
# docker tag tez-dashboard:latest your-registry/tez-dashboard:latest
# docker push your-registry/tez-dashboard:latest

# ============================================
# OPTION 4: Deploy to specific server via SSH
# ============================================
# Uncomment and configure for your server

# SERVER="user@your-server.com"
# DEPLOY_PATH="/var/www/tez-dashboard"
# 
# echo "📦 Building..."
# npm run build
# 
# echo "📤 Uploading to server..."
# rsync -avz --exclude 'node_modules' ./ $SERVER:$DEPLOY_PATH/
# 
# echo "🔄 Restarting application..."
# ssh $SERVER "cd $DEPLOY_PATH && npm install && pm2 restart tez-dashboard"

echo ""
echo "🎉 Deployment process complete!"
