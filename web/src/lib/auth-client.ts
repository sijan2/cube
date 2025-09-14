import { createAuthClient } from 'better-auth/react';

// Define the base URL for the auth API with environment awareness
const getBaseURL = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';
  
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    console.log('[Auth Client] Using backend URL:', backendUrl);
    console.log('[Auth Client] Environment variables:', {
      VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
      DEV: import.meta.env.DEV,
    });
  }

  return backendUrl;
};

const baseURL = getBaseURL();

// Create the auth client with proper configuration
export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: 'include',
    mode: 'cors',
  },
});

// Export methods with proper typing
export const { signIn, signUp, signOut, useSession, getSession, $fetch } = authClient;

// Enhanced types that match better-auth structure
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: User;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

// Narrow a possible Data<T> response into plain T | null
export const unwrapSession = (result: unknown): Session | null => {
  const maybeData = result && typeof result === 'object' && 'data' in (result as any)
    ? (result as any).data
    : result
  if (maybeData && typeof maybeData === 'object' && 'user' in (maybeData as any)) {
    return maybeData as Session
  }
  return null
}

// Helper function for handling auth errors
export const handleAuthError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected authentication error occurred';
};

// Helper function for checking auth status
export const getAuthStatus = async (): Promise<{ isAuthenticated: boolean; user: User | null }> => {
  try {
    console.log('[Auth Client] Checking auth status...');
    const session = await getSession();
    console.log('[Auth Client] getSession raw result:', session);
    return {
      isAuthenticated: !!session?.user,
      user: session?.user || null,
    };
  } catch (error) {
    console.error('[Auth Client] Error checking auth status:', handleAuthError(error));
    return {
      isAuthenticated: false,
      user: null,
    };
  }
};