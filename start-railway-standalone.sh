#!/bin/sh

echo "🚀 Starting Python MCP Server on Railway..."

# Set default port if not provided by Railway
export PORT=${PORT:-8000}

echo "📋 Configuration:"
echo "  - Port: $PORT"
echo "  - Environment: ${ENVIRONMENT:-production}"

# Start the Python MCP server
python src/server.py