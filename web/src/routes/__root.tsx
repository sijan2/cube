import React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { ThemeProvider } from '@/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Outlet />
      <Toaster />
      {import.meta.env.DEV && <DevtoolsLazyLoader />}
    </ThemeProvider>
  ),
})

// Lazy load devtools component only in development
function DevtoolsLazyLoader() {
  const [devtoolsComponents, setDevtoolsComponents] = React.useState<{
    TanstackDevtools: any;
    TanStackRouterDevtoolsPanel: any;
  } | null>(null);

  React.useEffect(() => {
    if (import.meta.env.DEV) {
      Promise.all([
        import('@tanstack/react-devtools'),
        import('@tanstack/react-router-devtools')
      ]).then(([devtools, routerDevtools]) => {
        setDevtoolsComponents({
          TanstackDevtools: devtools.TanstackDevtools,
          TanStackRouterDevtoolsPanel: routerDevtools.TanStackRouterDevtoolsPanel,
        });
      });
    }
  }, []);

  if (!devtoolsComponents) return null;

  const { TanstackDevtools, TanStackRouterDevtoolsPanel } = devtoolsComponents;

  return (
    <TanstackDevtools
      config={{
        position: 'bottom-left',
      }}
      plugins={[
        {
          name: 'Tanstack Router',
          render: <TanStackRouterDevtoolsPanel />,
        },
      ]}
    />
  );
}
