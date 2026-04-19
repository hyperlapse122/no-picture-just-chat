import { QueryClient } from '@tanstack/react-query';

/**
 * Per-request QueryClient on server (NEVER module-singleton).
 * Singleton on client to share cache across navigations.
 *
 * staleTime: 60_000 ms ensures prefetched SSR data isn't immediately
 * refetched on hydration. See `.agents/skills/npjc-ssr-data-fetching/SKILL.md`.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return createQueryClient();
  }

  if (!browserClient) {
    browserClient = createQueryClient();
  }

  return browserClient;
}
