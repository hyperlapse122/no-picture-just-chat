---
name: npjc-ssr-data-fetching
description: 'SSR data-fetching rule for no-picture-just-chat: use tRPC + TanStack Query prefetch in loaders, never return query data from loaders. Triggers on: loader, prefetch, useQuery, ensureQueryData, SSR, hydration, Route.useLoaderData.'
triggers:
  [
    'loader',
    'prefetch',
    'useQuery',
    'ensureQueryData',
    'SSR',
    'hydration',
    'Route.useLoaderData',
    'queryOptions',
    'createServerTRPC',
  ]
---

# NPJC SSR Data Fetching Strategy

**The Rule**: Loaders MUST prefetch data into the `queryClient` cache using `ensureQueryData` and MUST NOT return that data to the component.

## Why

- **Zero-Hydration Refetch**: Using the same `queryOptions` in both loader and component ensures the cache keys match perfectly, preventing React Query from refetching data immediately upon hydration.
- **Server-Side Rendering**: Prefetching in loaders ensures the initial HTML sent to the client contains the necessary data, improving SEO and perceived performance.
- **Type Safety**: tRPC's `queryOptions` provides end-to-end type safety from the server router to the frontend component.
- **Cache Management**: Keeping data in the `queryClient` rather than passing it through `useLoaderData` centralizes state management and cache invalidation.

## Correct Pattern

### 1. Loader Implementation

Use `createServerTRPC` to create a proxy that forwards headers and use `ensureQueryData` to fill the cache.

```typescript
// apps/web/src/routes/posts.tsx
import { createFileRoute } from '@tanstack/react-router';
import { createServerTRPC } from '@/integrations/trpc/server';

export const Route = createFileRoute('/posts')({
  loader: async ({ context }) => {
    // 1. Create the server-side tRPC proxy
    const serverTrpc = createServerTRPC(context.queryClient);

    // 2. Prefetch data into the cache (do NOT return it)
    await context.queryClient.ensureQueryData(serverTrpc.posts.list.queryOptions({ limit: 10 }));
  },
  component: PostsComponent,
});
```

### 2. Component Implementation

Use `useQuery` with the same `queryOptions`. The data will be read from the hydrated cache without a network request.

```typescript
// apps/web/src/routes/posts.tsx (continued)
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/integrations/trpc/react';

function PostsComponent() {
  const trpc = useTRPC();

  // This uses the data prefetched in the loader
  const { data } = useQuery(
    trpc.posts.list.queryOptions({ limit: 10 })
  );

  return (
    <ul>
      {data?.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

## Anti-Patterns

### ❌ Wrong: returning data from loader / using `Route.useLoaderData`

```typescript
// WRONG — do NOT do this
export const Route = createFileRoute('/posts')({
  loader: async ({ context }) => {
    const serverTrpc = createServerTRPC(context.queryClient);
    // ❌ Fetching and RETURNING data — bypasses React Query cache entirely
    const posts = await serverTrpc.posts.list.query({ limit: 10 });
    return { posts }; // ❌ Never return query data from a loader
  },
  component: PostsComponent,
});

function PostsComponent() {
  // ❌ Reading from loader data instead of the cache
  const { posts } = Route.useLoaderData();
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

**Why it's wrong**: Bypasses React Query's cache entirely. Data is not dehydrated/rehydrated, so the client refetches on every navigation. No cache invalidation, no stale-while-revalidate, no devtools visibility.

### ❌ Wrong: using `prefetchQuery` instead of `ensureQueryData`

```typescript
// WRONG — do NOT do this
loader: async ({ context }) => {
  // ❌ prefetchQuery silently swallows errors — blank page on failure
  await context.queryClient.prefetchQuery(serverTrpc.posts.list.queryOptions());
},
```

**Why it's wrong**: `prefetchQuery` does not throw on error. If the server call fails, the loader succeeds silently and the component renders with `undefined` data.

### ❌ Wrong: mismatched `queryOptions` between loader and component

```typescript
// WRONG — do NOT do this
loader: (async ({ context }) => {
  // Loader uses limit: 10
  await context.queryClient.ensureQueryData(serverTrpc.posts.list.queryOptions({ limit: 10 }));
},
  function PostsComponent() {
    // ❌ Component uses limit: 20 — different cache key, triggers refetch
    const { data } = useQuery(trpc.posts.list.queryOptions({ limit: 20 }));
  });
```

| Pattern                                         | Why it's wrong                                                                                              | Correct Alternative                                       |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `return data` from loader                       | Forces `useLoaderData` which bypasses React Query's cache and features.                                     | Use `ensureQueryData` and return nothing (or metadata).   |
| `context.queryClient.prefetchQuery(...)`        | `prefetchQuery` doesn't throw on error, potentially leading to blank pages without proper error boundaries. | Use `context.queryClient.ensureQueryData(...)`.           |
| `staleTime: 0` (default)                        | Prefetched data is considered stale immediately, triggering a refetch on hydration.                         | `staleTime: 60_000` is set globally in `query-client.ts`. |
| Manual `<HydrationBoundary>`                    | Redundant; `setupRouterSsrQueryIntegration` handles hydration automatically.                                | Omit manual hydration boundaries.                         |
| Different `queryOptions` in loader vs component | Cache keys won't match, causing a refetch on the client.                                                    | Use identical `queryOptions` and inputs.                  |

## Setup Checklist

- [x] **Global staleTime**: `staleTime: 60_000` must be configured in `apps/web/src/integrations/query-client.ts`.
- [x] **SSR Query Integration**: `setupRouterSsrQueryIntegration` must be called during router initialization.
- [x] **Per-Request QueryClient**: The server must create a fresh `QueryClient` for every request to avoid cross-request cache leakage.

## Allowed Loader Returns

Loaders should only return non-query metadata or perform redirects:

- `return { title: 'Post List' }` (SEO metadata)
- `throw redirect({ to: '/login' })` (Auth guards)
- `return undefined` (Default)

## Mutation Pattern

Mutations should use the `mutationOptions` from the tRPC proxy to maintain consistency and type safety.

```typescript
const trpc = useTRPC();
const mutation = useMutation(
  trpc.posts.create.mutationOptions({
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries(trpc.posts.list.pathFilter());
    },
  }),
);
```

## Verification Commands

To verify that SSR is working and the HTML contains prefetched data:

```bash
# Check if the response contains the expected data string
curl -s http://localhost:3000/posts | grep "Expected Data String"
```

## Reference Files

- `apps/web/src/integrations/trpc/server.ts`: `createServerTRPC` implementation.
- `apps/web/src/integrations/trpc/react.ts`: `useTRPC` implementation.
- `apps/web/src/integrations/query-client.ts`: `QueryClient` configuration and `staleTime`.
- `apps/web/src/routes/index.tsx`: Canonical example of the pattern.
