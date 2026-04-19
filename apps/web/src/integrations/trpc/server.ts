import { getRequestHeaders } from '@tanstack/react-start/server';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import type { QueryClient } from '@tanstack/react-query';
import type { AppRouter } from '@/server/trpc/router';

/**
 * Server-side tRPC options proxy for use in TanStack Router loaders.
 * Forwards request headers (including session cookie) to enable authenticated
 * queries during SSR.
 *
 * NOTE: Per `npjc-ssr-data-fetching` skill, loaders MUST use this proxy with
 * `context.queryClient.ensureQueryData(...)` and MUST NOT return query data.
 */
export function createServerTRPC(queryClient: QueryClient) {
  const headers = getRequestHeaders();

  const client = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'}/api/trpc`,
        headers: () => Object.fromEntries(headers.entries()),
      }),
    ],
  });

  return createTRPCOptionsProxy<AppRouter>({
    client,
    queryClient,
  });
}
