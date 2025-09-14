import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { renderTrpcPanel } from 'trpc-panel';
import dotenv from 'dotenv';
import { appRouter } from './router';
import { createContext } from './lib/context';
import { auth } from './lib/auth';

// Load environment variables
dotenv.config();
console.log('Environment loaded:');
console.log('POKE_API_KEY length:', process.env.POKE_API_KEY?.length || 0);
console.log('DATABASE_URL configured:', !!process.env.DATABASE_URL);
console.log('GOOGLE_CLIENT_ID configured:', !!process.env.GOOGLE_CLIENT_ID);
console.log('BETTER_AUTH_SECRET configured:', !!process.env.BETTER_AUTH_SECRET);

const app = express();
const port = process.env.PORT || 3003;

// Simple broadcast for chat responses
const sseClients = new Set<express.Response>();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://abe52968.cube-web-dq8.pages.dev',
      'https://cube-web-dq8.pages.dev',
      'https://cube-web.pages.dev'
    ];
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // Check if origin matches any pattern
    if (allowedOrigins.includes(origin) || 
        origin.includes('.cube-web') || 
        origin.includes('.pages.dev')) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true, // Enable cookies
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400 // Cache preflight for 24 hours
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Handle OPTIONS preflight requests for auth routes
app.options('/api/auth/*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(200);
});

// Better Auth routes
app.all('/api/auth/*', async (req, res) => {
  console.log(`Better Auth request: ${req.method} ${req.url}`);
  
  // Check verifications before and after certain requests
  if (req.url?.includes('sign-in/social') || req.url?.includes('callback')) {
    try {
      const { db } = await import('./db');
      const { verifications } = await import('./db/schema');
      const verificationsData = await db.select().from(verifications);
      console.log(`Verifications count: ${verificationsData.length}`);
      if (verificationsData.length > 0) {
        console.log('Latest verification:', verificationsData[verificationsData.length - 1]);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.log('Error checking verifications:', message);
    }
  }
  
  try {
    const url = new URL(req.url!, `http://${req.get('host')}`);
    console.log('Full URL:', url.toString());
    
    const headers: Record<string, string> = {};
    Object.keys(req.headers).forEach(key => {
      const value = req.headers[key];
      if (value) {
        headers[key] = Array.isArray(value) ? value.join(',') : value;
      }
    });

    let body: string | undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const request = new Request(url.toString(), {
      method: req.method,
      headers,
      body,
    });

    const response = await auth.handler(request);
    console.log(`Better Auth response: ${response.status}`);
    
    // Log response body for errors
    if (response.status >= 400) {
      const responseText = await response.clone().text();
      console.log('Error response body:', responseText);
    }

    // Set response status and headers
    res.status(response.status);

    // Copy all headers except set-cookie (handled separately for multiple values)
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') return;
      res.setHeader(key, value);
    });

    // Forward Set-Cookie headers correctly (can be multiple)
    // Undici/Node fetch supports getSetCookie() in runtime; fall back to raw()/get
    const anyHeaders: any = response.headers as any;
    const setCookies: string[] | undefined =
      (typeof anyHeaders.getSetCookie === 'function' && anyHeaders.getSetCookie()) ||
      (typeof anyHeaders.raw === 'function' && anyHeaders.raw()['set-cookie']) ||
      (response.headers.get('set-cookie') ? [response.headers.get('set-cookie') as string] : undefined);

    if (Array.isArray(setCookies) && setCookies.length > 0) {
      res.setHeader('set-cookie', setCookies);
    }

    // Send response body
    if (response.body) {
      const text = await response.text();
      res.send(text);
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Better Auth error:', error);
    const details = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: 'Auth handler failed', details });
  }
});

// tRPC middleware
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
    batching: {
      enabled: true,
    },
  })
);

// tRPC Panel - GUI for testing
app.use('/panel', (_req, res) => {
  return res.send(
    renderTrpcPanel(appRouter, {
      url: `http://localhost:${port}/trpc`,
    })
  );
});

// New endpoint to proxy SMS sending
app.post('/api/send-sms', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const API_KEY = process.env.POKE_API_KEY;

  if (!API_KEY) {
    console.error('POKE_API_KEY is not set on the server.');
    return res.status(500).json({ error: 'Server configuration error: POKE_API_KEY is missing.' });
  }

  try {
    const pokeResponse = await fetch('https://poke.com/api/v1/inbound-sms/webhook', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });

    const data = await pokeResponse.json();

    if (!pokeResponse.ok) {
      console.error('Poke API returned an error:', { status: pokeResponse.status, body: data });
      return res.status(pokeResponse.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error proxying request to Poke API:', errorMessage);
    res.status(500).json({ error: 'Failed to proxy request.', details: errorMessage });
  }
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'cube-server',
    auth: !!process.env.BETTER_AUTH_SECRET,
    database: !!process.env.DATABASE_URL,
    google: !!process.env.GOOGLE_CLIENT_ID,
  });
});

// Debug endpoint to check verification table
app.get('/debug/verification', async (_req, res) => {
  try {
    const { db } = await import('./db');
    const { verifications } = await import('./db/schema');
    const verificationsData = await db.select().from(verifications).limit(10);
    res.json({ verifications: verificationsData });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

// Debug endpoint to clear verification table
app.post('/debug/clear-verification', async (_req, res) => {
  try {
    const { db } = await import('./db');
    const { verifications } = await import('./db/schema');
    await db.delete(verifications);
    res.json({ success: true, message: 'Verification table cleared' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

// Simple SSE endpoint for chat responses
app.get('/api/chat/stream', (req, res) => {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Access-Control-Allow-Credentials': 'true',
  });

  // Add client to broadcast list
  sseClients.add(res);
  console.log(`SSE client connected. Total clients: ${sseClients.size}`);

  // Send initial connection confirmation
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    sseClients.delete(res);
    console.log(`SSE client disconnected. Total clients: ${sseClients.size}`);
  });

  // Keep connection alive with heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    if (sseClients.has(res)) {
      try {
        res.write(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`);
      } catch (error) {
        clearInterval(heartbeat);
        sseClients.delete(res);
      }
    } else {
      clearInterval(heartbeat);
    }
  }, 30000);
});

// Simple webhook endpoint for your backend to send chat responses
app.post('/api/webhook/chat-response', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }

  console.log(`Broadcasting chat response to ${sseClients.size} clients:`, message.substring(0, 100) + '...');

  // Broadcast to all connected SSE clients
  const messageData = JSON.stringify({ type: 'response', message });
  const disconnectedClients = new Set<express.Response>();

  for (const client of sseClients) {
    try {
      client.write(`data: ${messageData}\n\n`);
    } catch (error) {
      console.error('Error sending to SSE client:', error);
      disconnectedClients.add(client);
    }
  }

  // Clean up disconnected clients
  disconnectedClients.forEach(client => sseClients.delete(client));

  res.json({
    success: true,
    clientsNotified: sseClients.size,
    message: 'Response broadcasted to all connected clients'
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📡 tRPC endpoint: http://localhost:${port}/trpc`);
  console.log(`🎯 tRPC Panel GUI: http://localhost:${port}/panel`);
  console.log(`🔐 Auth endpoint: http://localhost:${port}/api/auth`);
  console.log(`💬 Chat Webhook URL: http://localhost:${port}/api/webhook/chat-response`);
  console.log(`📡 Chat SSE Stream: http://localhost:${port}/api/chat/stream`);
  console.log(`🌴 Poke API configured: ${!!process.env.POKE_API_KEY}`);
  console.log(`🗄️  Database configured: ${!!process.env.DATABASE_URL}`);
  console.log(`🔑 Google OAuth configured: ${!!process.env.GOOGLE_CLIENT_ID}`);
});