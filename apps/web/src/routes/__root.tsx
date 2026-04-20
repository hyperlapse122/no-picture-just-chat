import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { TRPCProvider } from '@/integrations/trpc/react';
import { trpcClient } from '@/integrations/trpc/client';
import appCss from '@/styles/app.css?url';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Misty Pixel' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground min-h-screen">
        <main className="mx-auto max-w-2xl p-6">
          <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
            <Outlet />
          </TRPCProvider>
        </main>
        {import.meta.env.DEV && (
          <>
            <TanStackRouterDevtools />
            <ReactQueryDevtools initialIsOpen={false} />
          </>
        )}
        <Scripts />
      </body>
    </html>
  );
}
