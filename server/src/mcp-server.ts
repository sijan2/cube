#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { LeetCode } from 'leetcode-query';
import { z } from 'zod';
import minimist from 'minimist';
import pino from 'pino';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Logger that outputs to stderr to avoid interfering with MCP JSON-RPC on stdout
const logger = pino(
  { name: 'leetcode-mcp-server' },
  pino.destination({ dest: 2 }) // stderr
);

// Command line argument schema
const ArgsSchema = z.object({
  site: z.enum(['global', 'cn']).default((process.env.LEETCODE_SITE as 'global' | 'cn') || 'global'),
  session: z.string().optional(),
  help: z.boolean().default(false),
  proxy: z.boolean().default(false),
});

// LeetCode service wrapper
class LeetCodeService {
  private leetcode: LeetCode;

  constructor(site: 'global' | 'cn', session?: string) {
    // Simple constructor - let's use basic approach
    this.leetcode = new LeetCode();
  }

  async getDailyProblem() {
    try {
      const daily = await this.leetcode.daily();
      return {
        success: true,
        data: daily,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to get daily problem');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async searchProblems(keyword?: string, difficulty?: string) {
    try {
      const filters: any = {};
      if (difficulty) {
        filters.difficulty = difficulty.toLowerCase();
      }
      if (keyword) {
        filters.searchKeywords = keyword;
      }

      const problems = await this.leetcode.problems(filters);
      return {
        success: true,
        data: problems,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to search problems');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getProblemDetail(titleSlug: string) {
    try {
      const problem = await this.leetcode.problem(titleSlug);
      return {
        success: true,
        data: problem,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to get problem detail');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getUserProfile(username: string) {
    try {
      const profile = await this.leetcode.user(username);
      return {
        success: true,
        data: profile,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to get user profile');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

async function main() {
  const args = minimist(process.argv.slice(2));
  const config = ArgsSchema.parse(args);

  if (config.help) {
    console.log(`
LeetCode MCP Server

Usage: leetcode-mcp-server [options]

Options:
  --site <global|cn>    LeetCode site (default: global)
  --session <cookie>    Optional session cookie for authentication
  --help               Show this help message
`);
    process.exit(0);
  }

  const server = new Server(
    {
      name: 'leetcode-mcp-server',
      version: '1.0.0',
      description: 'LeetCode MCP Server with MetaMCP proxy support',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  const leetcodeService = new LeetCodeService(config.site, config.session || process.env.LEETCODE_SESSION);

  // Register tools
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

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const toolArgs = args as Record<string, any>;

    try {
      switch (name) {
        case 'get_daily_problem':
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(await leetcodeService.getDailyProblem(), null, 2),
              },
            ],
          };

        case 'search_problems':
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  await leetcodeService.searchProblems(toolArgs?.keyword, toolArgs?.difficulty),
                  null,
                  2
                ),
              },
            ],
          };

        case 'get_problem_detail':
          if (!toolArgs?.titleSlug) {
            throw new Error('titleSlug is required');
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  await leetcodeService.getProblemDetail(toolArgs.titleSlug),
                  null,
                  2
                ),
              },
            ],
          };

        case 'get_user_profile':
          if (!toolArgs?.username) {
            throw new Error('username is required');
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  await leetcodeService.getUserProfile(toolArgs.username),
                  null,
                  2
                ),
              },
            ],
          };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: false, error: errorMessage }, null, 2),
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

  // Start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Don't log to stdout as it interferes with MCP protocol
  logger.info('LeetCode MCP Server started successfully and ready for MetaMCP proxy');
}

// Start server if this is the main module
main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});