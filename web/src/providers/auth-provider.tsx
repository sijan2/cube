import type { Session as BetterAuthSession } from '@/lib/auth-client';
import { getSession } from '@/lib/auth-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type React from 'react';
import { createContext, useCallback, useContext, useMemo } from 'react';

// Define types for our context
interface AuthContextType {
  session: BetterAuthSession | null | undefined;
  isSessionLoading: boolean;
  sessionError: Error | null;
  refreshSession: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define query keys
const SESSION_QUERY_KEY = ['session'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Query for user session
  const {
    data: session,
    isLoading: isSessionLoading,
    error: sessionError,
  } = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async () => {
      console.log('[AuthProvider] Fetching session...');
      try {
        const result = await getSession();
        console.log('[AuthProvider] Raw session result:', result);

        // Unwrap Data<T> shape from better-auth client
        const unwrapped =
          result && typeof result === 'object' && 'data' in result
            ? (result as any).data
            : result;

        if (unwrapped && typeof unwrapped === 'object' && 'user' in unwrapped) {
          console.log('[AuthProvider] Valid session found:', unwrapped);
          return unwrapped as BetterAuthSession;
        }

        console.log('[AuthProvider] No valid session found');
        return null;
      } catch (error) {
        console.error('[AuthProvider] Error fetching session:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 1, // Only retry once on failure
  });

  const refreshSession = useCallback(async () => {
    console.log('[AuthProvider] Refreshing session...');
    await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
  }, [queryClient]);

  // Memoize context value
  const value = useMemo(
    () => ({
      session,
      isSessionLoading,
      sessionError,
      refreshSession,
    }),
    [
      session,
      isSessionLoading,
      sessionError,
      refreshSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Re-export types
export type { BetterAuthSession as Session };
export type User = BetterAuthSession['user'];