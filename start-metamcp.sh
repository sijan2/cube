#!/bin/bash

# Start MetaMCP with LeetCode MCP Server Integration
# This script starts the MetaMCP proxy server that will expose your LeetCode MCP server via HTTP/SSE

echo "🚀 Starting MetaMCP with LeetCode MCP Server integration..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Build the server first
echo "📦 Building the server..."
cd server && npm run build && cd ..

# Start the services using Docker Compose
echo "🐳 Starting services with Docker Compose..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 5

# Check if MetaMCP is accessible
if curl -f http://localhost:12008/health >/dev/null 2>&1; then
    echo "✅ MetaMCP is running at http://localhost:12008"
    echo "📊 LeetCode MCP tools are available via:"
    echo "   - SSE: http://localhost:12008/sse"
    echo "   - Stream: http://localhost:12008/stream"
else
    echo "⚠️  MetaMCP might still be starting. Check with: docker-compose logs metamcp"
fi

echo "🎉 Setup complete! Your LeetCode MCP server is now accessible via MetaMCP proxy."