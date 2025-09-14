#!/bin/bash

echo "🚀 Starting LeetCode MCP + MetaMCP on Railway..."

# Set default port if not provided by Railway
export PORT=${PORT:-8080}

echo "📋 Configuration:"
echo "  - Port: $PORT"
echo "  - LeetCode Site: ${LEETCODE_SITE:-global}"
echo "  - Node Environment: ${NODE_ENV:-production}"

# Start MetaMCP with our configuration
echo "🔧 Starting MetaMCP proxy..."
exec ./metamcp --config metamcp-config.json