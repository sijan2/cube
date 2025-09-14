import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema";
import { getSocialProviders } from "./auth-providers";

// Get environment variables with defaults for development
const getEnvConfig = () => {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002';
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  return {
    NODE_ENV,
    BACKEND_URL,
    FRONTEND_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  };
};

const env = getEnvConfig();

export const auth = betterAuth({
  baseURL: env.BACKEND_URL,
  secret: env.BETTER_AUTH_SECRET,
  
  // Environment-aware trusted origins
  trustedOrigins: [
    env.FRONTEND_URL,
    env.BACKEND_URL,
    // Cloudflare Pages domains
    'https://abe52968.cube-web-dq8.pages.dev',
    'https://cube-web-dq8.pages.dev',
    'https://cube-web.pages.dev',
    // Development origins
    ...(env.NODE_ENV === 'development' 
      ? ['http://localhost:3000', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://127.0.0.1:3002']
      : []),
  ],
  
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  
  // Use modular social providers configuration
  socialProviders: getSocialProviders(env as Record<string, string>),
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  
  // Environment-aware cookie configuration
  advanced: {
    cookiePrefix: env.NODE_ENV === 'development' ? 'cube-dev' : 'cube',
    useSecureCookies: env.NODE_ENV === 'production',
    crossSubDomainCookies: {
      enabled: false, // Keep disabled for localhost
    },
  },
  
  // Account linking configuration
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google'],
    },
  },
});

export type Session = typeof auth.$Infer.Session;