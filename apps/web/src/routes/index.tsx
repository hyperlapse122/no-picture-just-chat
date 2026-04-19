import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useTRPC } from '@/integrations/trpc/react';
import { createServerTRPC } from '@/integrations/trpc/server';

export const Route = createFileRoute('/')({
  loader: async ({ context }) => {
    const serverTrpc = createServerTRPC(context.queryClient);

    await context.queryClient.ensureQueryData(serverTrpc.demo.greet.queryOptions({ name: 'qa' }));
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
