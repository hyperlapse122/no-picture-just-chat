import { useQuery } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { createFileRoute } from '@tanstack/react-router';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@/server/trpc/router';

const getGreeting = createServerFn({ method: 'GET' }).handler(async () => {
  const { getRequestHeaders } = await import('@tanstack/react-start/server');
  const headers = getRequestHeaders();

  const client = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'}/api/trpc`,
        headers: () => Object.fromEntries(headers.entries()),
      }),
    ],
  });

  return client.demo.greet.query({ name: 'qa' });
});

function greetingQueryOptions() {
  return {
    queryKey: ['demo', 'greet', 'qa'],
    queryFn: () => getGreeting(),
  };
}

export const Route = createFileRoute('/')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(greetingQueryOptions());
  },
  component: HomeComponent,
});

function HomeComponent() {
  const { data } = useQuery(greetingQueryOptions());

  return (
    <div>
      <h1 data-testid="home-greeting">{data?.greeting ?? 'Loading…'}</h1>
    </div>
  );
}
