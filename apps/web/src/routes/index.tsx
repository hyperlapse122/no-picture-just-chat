import { createServerFn } from '@tanstack/react-start';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { trpcClient } from '@/integrations/trpc/client';
import { useTRPC } from '@/integrations/trpc/react';

const fetchGreeting = createServerFn({ method: 'GET' }).handler(async () => {
  const { QueryClient } = await import('@tanstack/react-query');
  const { createServerTRPC } = await import('@/integrations/trpc/server.server');

  const queryClient = new QueryClient();
  const serverTrpc = createServerTRPC(queryClient);

  return queryClient.ensureQueryData(serverTrpc.demo.greet.queryOptions({ name: 'qa' }));
});

export const Route = createFileRoute('/')({
  loader: async ({ context }) => {
    const data = await fetchGreeting();
    const trpc = createTRPCOptionsProxy({ client: trpcClient, queryClient: context.queryClient });

    context.queryClient.setQueryData(trpc.demo.greet.queryOptions({ name: 'qa' }).queryKey, data);
  },
  component: HomeComponent,
});

function HomeComponent() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.demo.greet.queryOptions({ name: 'qa' }));

  return (
    <div>
      <h1 data-testid="home-greeting">{data?.greeting ?? 'Loading…'}</h1>
    </div>
  );
}
