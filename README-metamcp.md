# LeetCode MCP + MetaMCP Integration

This integration allows your LeetCode MCP server to be accessed via HTTP/SSE endpoints through the MetaMCP proxy.

## Quick Start

1. **Start the integrated services:**
   ```bash
   ./start-metamcp.sh
   ```

2. **Access your LeetCode MCP tools via HTTP:**
   - **Base URL:** `http://localhost:12008`
   - **SSE Endpoint:** `http://localhost:12008/sse`
   - **Stream Endpoint:** `http://localhost:12008/stream`

## Available Tools

Your LeetCode MCP server exposes these tools via MetaMCP:

- `get_daily_problem` - Get today's daily LeetCode problem
- `search_problems` - Search problems by keyword and difficulty  
- `get_problem_detail` - Get detailed info about a specific problem
- `get_user_profile` - Get user profile information

## Example HTTP Usage

```bash
# Get daily problem via curl
curl -X POST http://localhost:12008/api/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name": "get_daily_problem", "arguments": {}}'

# Search for problems
curl -X POST http://localhost:12008/api/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name": "search_problems", "arguments": {"difficulty": "easy", "keyword": "array"}}'
```

## Configuration

Edit `metamcp-config.json` to customize:
- Port (default: 12008)
- CORS settings
- Authentication
- Transport methods (SSE/Streamable)

## Environment Variables

Copy `.env.example` to `.env` and configure:
```
LEETCODE_SITE=global
LEETCODE_SESSION=your_session_cookie
DATABASE_URL=postgresql://postgres:password@localhost:5432/cube
```

## Manual Development

For development without Docker:

1. **Install MetaMCP:**
   ```bash
   git clone https://github.com/metatool-ai/metamcp.git
   cd metamcp
   cp example.env .env
   ```

2. **Start MetaMCP with your config:**
   ```bash
   # Copy your config to MetaMCP directory
   cp ../metamcp-config.json ./config.json
   
   # Start MetaMCP
   docker compose up -d
   ```

3. **Test your LeetCode MCP server:**
   ```bash
   cd ../server
   npm run mcp:dev
   ```

## Integration Benefits

- **HTTP Access:** Your MCP server is now accessible via standard HTTP requests
- **Web Integration:** Easy integration with web applications and APIs
- **SSE Support:** Real-time streaming capabilities
- **CORS Enabled:** Cross-origin requests supported
- **Scalable:** Docker-based deployment ready for production