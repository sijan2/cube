#!/bin/bash

echo "🚀 Deploying LeetCode MCP + MetaMCP to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway..."
    railway login
fi

echo "📦 Preparing deployment..."

# Ensure build files exist
if [ ! -f "railway.json" ]; then
    echo "❌ railway.json not found. Make sure you're in the correct directory."
    exit 1
fi

if [ ! -f "Dockerfile.railway" ]; then
    echo "❌ Dockerfile.railway not found. Make sure you're in the correct directory."
    exit 1
fi

# Initialize Railway project if needed
if [ ! -f ".railway/railway.json" ]; then
    echo "🔧 Initializing Railway project..."
    railway init
fi

echo "🌐 Deploying to Railway..."
railway up

echo "✅ Deployment initiated! Check your Railway dashboard for progress."
echo "📊 Your service will be available at: https://your-project-name.railway.app"
echo ""
echo "Next steps:"
echo "1. Set environment variables in Railway dashboard:"
echo "   - LEETCODE_SITE=global"
echo "   - LEETCODE_SESSION=your_cookie (optional)"
echo "2. Wait for deployment to complete"
echo "3. Test with: curl https://your-url.railway.app/health"