import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { renderTrpcPanel } from 'trpc-panel';
import dotenv from 'dotenv';
import { appRouter } from './router';

// Load environment variables
dotenv.config();
console.log('Environment loaded:');
console.log('POKE_API_KEY length:', process.env.POKE_API_KEY?.length || 0);
console.log('POKE_API_KEY first 10 chars:', process.env.POKE_API_KEY?.substring(0, 10) || 'undefined');

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// tRPC middleware
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
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

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'cube-server'
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📡 tRPC endpoint: http://localhost:${port}/trpc`);
  console.log(`🎯 tRPC Panel GUI: http://localhost:${port}/panel`);
  console.log(`🌴 Poke API configured: ${!!process.env.POKE_API_KEY}`);
});