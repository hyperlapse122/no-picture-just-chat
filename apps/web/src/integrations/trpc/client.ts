import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@/server/trpc/router';

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';

  return process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';
}

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers() {
        if (typeof window !== 'undefined') return {};

        return {};
      },
      fetch(url, options) {
        return fetch(url, { ...options, credentials: 'include' });
      },
    }),
  ],
});
