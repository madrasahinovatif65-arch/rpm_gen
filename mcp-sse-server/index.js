import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

dotenv.config();

const app = express();
const PORT = process.env.MCP_PORT || 3000;
const AUTH_TOKEN = process.env.MCP_AUTH_TOKEN;
const execPromise = promisify(exec);

// Optional authentication - can be disabled for ZeroTier-only security
const AUTH_ENABLED = AUTH_TOKEN && AUTH_TOKEN.length > 0;

if (!AUTH_ENABLED) {
  console.log('⚠️  WARNING: Running without authentication. Relying on ZeroTier network isolation.');
} else {
  console.log('🔒 Authentication enabled with token');
}

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.text());

// Authentication middleware (optional)
function authenticate(req, res, next) {
  if (!AUTH_ENABLED) {
    return next(); // Skip auth if disabled
  }
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  
  const token = authHeader.substring(7);
  
  if (token !== AUTH_TOKEN) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  next();
}

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 100; // max requests per window

function rateLimit(req, res, next) {
  const clientId = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitMap.has(clientId)) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const clientData = rateLimitMap.get(clientId);
  
  if (now > clientData.resetTime) {
    // Reset window
    clientData.count = 1;
    clientData.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }
  
  if (clientData.count >= RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Rate limit exceeded. Try again in ' + Math.ceil((clientData.resetTime - now) / 1000) + ' seconds.' });
  }
  
  clientData.count++;
  next();
}

// Initialize MCP Server
const server = new Server(
  {
    name: 'antigravity-remote-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register MCP tools using schema-based API (SDK v0.5.0)
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'echo',
        description: 'Echo back the input message for testing',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Message to echo back'
            }
          },
          required: ['message']
        }
      },
      {
        name: 'system_info',
        description: 'Get system information from the server',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'execute_command',
        description: 'Execute a shell command on the server (use with caution)',
        inputSchema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'Command to execute'
            }
          },
          required: ['command']
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === 'echo') {
    return {
      content: [
        {
          type: 'text',
          text: `Echo: ${args.message}`
        }
      ]
    };
  }
  
  if (name === 'system_info') {
    const os = await import('os');
    const info = {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB`,
      freeMemory: `${Math.round(os.freemem() / 1024 / 1024 / 1024)} GB`,
      uptime: `${Math.round(os.uptime() / 3600)} hours`,
      nodeVersion: process.version
    };
    
    return {
      content: [
        {
          type: 'text',
          text: `System Information:\n${JSON.stringify(info, null, 2)}`
        }
      ]
    };
  }
  
  if (name === 'execute_command') {
    // Security: validate command before execution
    // In production, implement proper command whitelisting
    const dangerousPatterns = [
      'rm -rf',
      'format',
      'del /f',
      'shutdown',
      'reboot',
      ':(){:|:&};:' // fork bomb
    ];
    
    const isDangerous = dangerousPatterns.some(pattern => 
      args.command.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (isDangerous) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Command blocked for safety: Contains dangerous pattern`
          }
        ],
        isError: true
      };
    }
    
    try {
      const { stdout, stderr } = await execPromise(args.command, {
        timeout: 30000, // 30 second timeout
        maxBuffer: 1024 * 1024 // 1MB max output
      });
      
      return {
        content: [
          {
            type: 'text',
            text: `Command: ${args.command}\n\nOutput:\n${stdout}${stderr ? '\n\nErrors:\n' + stderr : ''}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error executing command: ${error.message}\n${error.stderr || ''}`
          }
        ],
        isError: true
      };
    }
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    server: 'antigravity-remote-mcp',
    authEnabled: AUTH_ENABLED,
    transport: 'SSE'
  });
});

// SSE endpoint with optional authentication
app.get('/sse', authenticate, rateLimit, async (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  console.log(`📱 Client connected via SSE from ${clientIp}`);
  
  const transport = new SSEServerTransport('/message', res);
  await server.connect(transport);
  
  // Handle client disconnect
  req.on('close', () => {
    console.log(`📱 Client disconnected: ${clientIp}`);
  });
});

// Message endpoint for SSE
app.post('/message', authenticate, rateLimit, async (req, res) => {
  // SSE messages are handled by the transport
  res.status(200).end();
});

// Start server - listen on all interfaces (0.0.0.0) to be accessible via ZeroTier
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🚀 ============================================');
  console.log('🚀 MCP SSE Server Started Successfully!');
  console.log('🚀 ============================================');
  console.log('');
  console.log(`📡 Local access:     http://localhost:${PORT}`);
  console.log(`📡 Network access:   http://0.0.0.0:${PORT}`);
  console.log(`📡 SSE endpoint:     http://0.0.0.0:${PORT}/sse`);
  console.log(`📡 Health check:     http://0.0.0.0:${PORT}/health`);
  console.log('');
  console.log(`🔒 Authentication:   ${AUTH_ENABLED ? 'ENABLED (Bearer token)' : 'DISABLED (ZeroTier isolation)'}`);
  console.log(`⚡ Rate limit:       ${RATE_LIMIT_MAX} requests per ${RATE_LIMIT_WINDOW/1000} seconds`);
  console.log('');
  console.log('💡 ZeroTier Setup:');
  console.log('   1. Install ZeroTier and join your network');
  console.log('   2. Note your ZeroTier IP (e.g., 172.28.0.100)');
  console.log('   3. Access from remote device: http://<zerotier-ip>:' + PORT);
  console.log('');
  console.log('✅ Server is ready to accept connections!');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n📴 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});
