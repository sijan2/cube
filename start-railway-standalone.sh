#!/bin/sh

echo "🚀 Starting LeetCode MCP Server (Standalone) on Railway..."

# Set default port if not provided by Railway
export PORT=${PORT:-8080}

echo "📋 Configuration:"
echo "  - Port: $PORT"
echo "  - LeetCode Site: ${LEETCODE_SITE:-global}"
echo "  - Node Environment: ${NODE_ENV:-production}"

# Create a proper MCP server with HTTP transport
cat > /app/server/mcp-http-server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema 
} = require('@modelcontextprotocol/sdk/types.js');
const { LeetCode } = require('leetcode-query');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Create MCP server instance
const server = new Server(
  {
    name: 'leetcode-mcp-server',
    version: '1.0.0',
    description: 'LeetCode MCP Server with JSON-RPC over HTTPS',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// LeetCode service
class LeetCodeService {
  constructor() {
    this.leetcode = new LeetCode();
  }

  async getDailyProblem() {
    try {
      const daily = await this.leetcode.daily();
      return { success: true, data: daily };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async searchProblems(keyword, difficulty) {
    try {
      const filters = {};
      if (difficulty) filters.difficulty = difficulty.toLowerCase();
      if (keyword) filters.searchKeywords = keyword;
      const problems = await this.leetcode.problems(filters);
      return { success: true, data: problems };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getProblemDetail(titleSlug) {
    try {
      const problem = await this.leetcode.problem(titleSlug);
      return { success: true, data: problem };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserProfile(username) {
    try {
      const profile = await this.leetcode.user(username);
      return { success: true, data: profile };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

const leetcodeService = new LeetCodeService();

// Register MCP handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_daily_problem',
        description: 'Get today\'s daily LeetCode problem',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'search_problems',
        description: 'Search LeetCode problems by keyword and difficulty',
        inputSchema: {
          type: 'object',
          properties: {
            keyword: {
              type: 'string',
              description: 'Search keyword for problem title or content',
            },
            difficulty: {
              type: 'string',
              enum: ['easy', 'medium', 'hard'],
              description: 'Filter by difficulty level',
            },
          },
        },
      },
      {
        name: 'get_problem_detail',
        description: 'Get detailed information about a specific problem',
        inputSchema: {
          type: 'object',
          properties: {
            titleSlug: {
              type: 'string',
              description: 'The problem title slug (e.g., "two-sum")',
            },
          },
          required: ['titleSlug'],
        },
      },
      {
        name: 'get_user_profile',
        description: 'Get user profile information',
        inputSchema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'LeetCode username',
            },
          },
          required: ['username'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const toolArgs = args || {};

  try {
    let result;
    switch (name) {
      case 'get_daily_problem':
        result = await leetcodeService.getDailyProblem();
        break;
      case 'search_problems':
        result = await leetcodeService.searchProblems(toolArgs.keyword, toolArgs.difficulty);
        break;
      case 'get_problem_detail':
        if (!toolArgs.titleSlug) throw new Error('titleSlug is required');
        result = await leetcodeService.getProblemDetail(toolArgs.titleSlug);
        break;
      case 'get_user_profile':
        if (!toolArgs.username) throw new Error('username is required');
        result = await leetcodeService.getUserProfile(toolArgs.username);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: false, error: error.message }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Register resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'leetcode://daily',
        mimeType: 'application/json',
        name: 'Daily Problem',
        description: 'Today\'s LeetCode daily problem',
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  
  if (uri === 'leetcode://daily') {
    const daily = await leetcodeService.getDailyProblem();
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(daily, null, 2),
        },
      ],
    };
  }
  
  throw new Error(`Unknown resource: ${uri}`);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'leetcode-mcp-server',
    protocol: 'JSON-RPC over HTTPS',
    endpoint: '/mcp'
  });
});

// MCP server info
app.get('/', (req, res) => {
  res.json({
    name: 'LeetCode MCP Server',
    version: '1.0.0',
    description: 'LeetCode MCP Server with HTTP transport',
    protocol: 'Model Context Protocol (MCP)',
    transport: 'HTTP',
    endpoints: {
      mcp: '/mcp',
      health: '/health'
    },
    connection: {
      url: 'https://cube-production-3225.up.railway.app/mcp',
      transport: 'http',
      format: 'MCP over HTTP'
    },
    usage: {
      format: 'Connect via MCP client using HTTP transport',
      url: 'https://cube-production-3225.up.railway.app/mcp'
    }
  });
});

// Add OPTIONS for CORS preflight
app.options('/mcp', cors());
app.options('/mcp/messages', cors());

// MCP HTTP+SSE transport endpoints
// SSE endpoint for client connections
app.get('/mcp', (req, res) => {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });

  // Send endpoint event as required by MCP spec
  res.write(`event: endpoint\\ndata: ${JSON.stringify({ uri: 'https://cube-production-3225.up.railway.app/mcp/messages' })}\\n\\n`);

  // Send ping to keep connection alive
  const pingInterval = setInterval(() => {
    res.write(`event: ping\\ndata: {}\\n\\n`);
  }, 30000);

  // Handle client disconnect
  req.on('close', () => {
    clearInterval(pingInterval);
    console.log('SSE connection closed');
  });

  console.log('MCP SSE connection established');
});

// HTTP POST endpoint for client messages
app.post('/mcp/messages', async (req, res) => {
  try {
    const request = req.body;
    
    // Validate JSON-RPC format
    if (!request.jsonrpc || request.jsonrpc !== '2.0' || !request.method) {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: request.id || null,
        error: {
          code: -32600,
          message: 'Invalid Request'
        }
      });
    }

    let response;

    // Handle MCP methods
    switch (request.method) {
      case 'initialize':
        response = {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
            resources: {}
          },
          serverInfo: {
            name: 'leetcode-mcp-server',
            version: '1.0.0'
          }
        };
        break;

      case 'tools/list':
        response = {
          tools: [
            {
              name: 'get_daily_problem',
              description: 'Get today\'s daily LeetCode problem',
              inputSchema: { type: 'object', properties: {} },
            },
            {
              name: 'search_problems',
              description: 'Search LeetCode problems by keyword and difficulty',
              inputSchema: {
                type: 'object',
                properties: {
                  keyword: { type: 'string', description: 'Search keyword' },
                  difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
                },
              },
            },
            {
              name: 'get_problem_detail',
              description: 'Get detailed information about a specific problem',
              inputSchema: {
                type: 'object',
                properties: { titleSlug: { type: 'string' } },
                required: ['titleSlug'],
              },
            },
            {
              name: 'get_user_profile',
              description: 'Get user profile information',
              inputSchema: {
                type: 'object',
                properties: { username: { type: 'string' } },
                required: ['username'],
              },
            },
          ],
        };
        break;
        
      case 'tools/call':
        const { name, arguments: args } = request.params;
        const toolArgs = args || {};
        let result;
        
        switch (name) {
          case 'get_daily_problem':
            result = await leetcodeService.getDailyProblem();
            break;
          case 'search_problems':
            result = await leetcodeService.searchProblems(toolArgs.keyword, toolArgs.difficulty);
            break;
          case 'get_problem_detail':
            if (!toolArgs.titleSlug) throw new Error('titleSlug is required');
            result = await leetcodeService.getProblemDetail(toolArgs.titleSlug);
            break;
          case 'get_user_profile':
            if (!toolArgs.username) throw new Error('username is required');
            result = await leetcodeService.getUserProfile(toolArgs.username);
            break;
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
        
        response = {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
        break;
        
      case 'resources/list':
        response = {
          resources: [
            {
              uri: 'leetcode://daily',
              mimeType: 'application/json',
              name: 'Daily Problem',
              description: 'Today\'s LeetCode daily problem',
            },
          ],
        };
        break;
        
      case 'resources/read':
        const { uri } = request.params;
        if (uri === 'leetcode://daily') {
          const daily = await leetcodeService.getDailyProblem();
          response = {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(daily, null, 2),
              },
            ],
          };
        } else {
          throw new Error(`Unknown resource: ${uri}`);
        }
        break;
        
      default:
        return res.status(400).json({
          jsonrpc: '2.0',
          id: request.id,
          error: {
            code: -32601,
            message: 'Method not found'
          }
        });
    }

    // Return JSON-RPC response
    res.json({
      jsonrpc: '2.0',
      id: request.id,
      result: response
    });

  } catch (error) {
    console.error('MCP SSE Handler Error:', error);
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body?.id || null,
      error: {
        code: -32603,
        message: 'Internal error',
        data: error.message
      }
    });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🎉 LeetCode MCP HTTP+SSE Server listening on port ${port}`);
  console.log(`📊 MCP Endpoint: https://0.0.0.0:${port}/mcp`);
  console.log(`🔧 Protocol: MCP over HTTP+SSE (compliant with spec)`);
});
EOF

# WebSocket dependency already installed via package.json

# Start the MCP HTTP server from the server directory where node_modules is
echo "🔧 Starting MCP HTTP server..."
cd /app/server && node mcp-http-server.js