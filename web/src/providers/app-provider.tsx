import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';
import { trpc, trpcClient } from '../lib/trpc';
import { AuthProvider } from './auth-provider';
import { CalendarProvider } from '../components/event-calendar/calendar-context';

interface AppProviderProps {
  children: React.ReactNode;
}

// Lazy load React Query devtools only in development
function ReactQueryDevtoolsLazyLoader() {
  const [ReactQueryDevtools, setReactQueryDevtools] = useState<any>(null);

  React.useEffect(() => {
    if (import.meta.env.DEV) {
      import('@tanstack/react-query-devtools').then((mod) => {
        setReactQueryDevtools(() => mod.ReactQueryDevtools);
      });
    }
  }, []);

  if (!ReactQueryDevtools) return null;

  return <ReactQueryDevtools initialIsOpen={false} />;
}

export function AppProvider({ children }: AppProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <AuthProvider>
          <CalendarProvider>
            {children}
            {import.meta.env.DEV && <ReactQueryDevtoolsLazyLoader />}
          </CalendarProvider>
        </AuthProvider>
      </trpc.Provider>
    </QueryClientProvider>
  );
}