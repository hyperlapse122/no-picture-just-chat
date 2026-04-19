import { createTRPCContext } from '@trpc/tanstack-react-query';
import type { AppRouter } from '@/server/trpc/router';

/**
 * React-bound tRPC proxy. Components MUST use `useTRPC()` instead of
 * importing `trpcClient` directly, because `useTRPC()` integrates with
 * the per-request QueryClient and the SSR cache.
 *
 * Usage:
 *   const trpc = useTRPC();
 *   const { data } = useQuery(trpc.demo.greet.queryOptions({ name: 'qa' }));
 *   const m = useMutation(trpc.demo.submit.mutationOptions());
 */
export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();
