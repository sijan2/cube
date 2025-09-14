import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { trpc, trpcClient } from '../lib/trpc';
import { AuthProvider } from './auth-provider';
import { CalendarProvider } from '../components/event-calendar/calendar-context';

interface AppProviderProps {
  children: React.ReactNode;
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
            <ReactQueryDevtools initialIsOpen={false} />
          </CalendarProvider>
        </AuthProvider>
      </trpc.Provider>
    </QueryClientProvider>
  );
}