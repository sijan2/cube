#!/bin/sh

echo "🚀 Starting LeetCode MCP Server (Standalone) on Railway..."

# Set default port if not provided by Railway
export PORT=${PORT:-8080}

echo "📋 Configuration:"
echo "  - Port: $PORT"
echo "  - LeetCode Site: ${LEETCODE_SITE:-global}"
echo "  - Node Environment: ${NODE_ENV:-production}"

# Create a simple HTTP wrapper for our MCP server
cat > /app/server/mcp-http-wrapper.js << 'EOF'
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'leetcode-mcp-server' });
});

// Basic info endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'LeetCode MCP Server',
    version: '1.0.0',
    description: 'HTTP wrapper for LeetCode MCP Server',
    endpoints: {
      health: '/health',
      tools: '/tools',
      execute: '/execute'
    }
  });
});

// List available tools
app.get('/tools', (req, res) => {
  res.json({
    tools: [
      {
        name: 'get_daily_problem',
        description: 'Get today\'s daily LeetCode problem'
      },
      {
        name: 'search_problems',
        description: 'Search LeetCode problems by keyword and difficulty'
      },
      {
        name: 'get_problem_detail',
        description: 'Get detailed information about a specific problem'
      },
      {
        name: 'get_user_profile',
        description: 'Get user profile information'
      }
    ]
  });
});

// Execute tool endpoint
app.post('/execute', async (req, res) => {
  const { tool, arguments: args = {} } = req.body;
  
  if (!tool) {
    return res.status(400).json({ error: 'Tool name is required' });
  }

  try {
    const mcp = spawn('node', ['dist/mcp-server.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    });

    let output = '';
    let error = '';

    // Send MCP JSON-RPC request
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: tool,
        arguments: args
      }
    };

    mcp.stdin.write(JSON.stringify(request) + '\n');
    mcp.stdin.end();

    mcp.stdout.on('data', (data) => {
      output += data.toString();
    });

    mcp.stderr.on('data', (data) => {
      error += data.toString();
    });

    mcp.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: 'MCP process failed', stderr: error });
      }

      try {
        // Parse MCP response
        const response = JSON.parse(output.trim());
        res.json(response);
      } catch (parseError) {
        res.status(500).json({ error: 'Failed to parse MCP response', output, stderr: error });
      }
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to execute tool', details: err.message });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🎉 LeetCode MCP HTTP wrapper listening on port ${port}`);
  console.log(`📊 Available at: http://0.0.0.0:${port}`);
});
EOF

# WebSocket dependency already installed via package.json

# Start the HTTP wrapper from the server directory where node_modules is
echo "🔧 Starting HTTP wrapper for MCP server..."
cd /app/server && node mcp-http-wrapper.js