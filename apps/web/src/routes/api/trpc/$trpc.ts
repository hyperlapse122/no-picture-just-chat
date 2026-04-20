import { createFileRoute } from '@tanstack/react-router';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/trpc/router';
import { createTRPCContext } from '@/server/trpc/context';

const handler = (request: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext: ({ req, info }) => createTRPCContext({ req, info, resHeaders: new Headers() }),
    onError: ({ error, path }) => {
      console.error(`[tRPC] ${path}:`, error.message);
    },
  });

export const Route = createFileRoute('/api/trpc/$trpc')({
  server: {
    handlers: {
      GET: ({ request }) => handler(request),
      POST: ({ request }) => handler(request),
    },
  },
});
