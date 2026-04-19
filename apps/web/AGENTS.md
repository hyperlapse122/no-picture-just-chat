# NPJC — Web App (`apps/web`)

Full-stack web application using TanStack Start. Private package `@h82/no-picture-just-chat-web`.

**Generated:** 2026-04-20 · **Commit:** [Current] · **Branch:** [Current]

---

# Overview

Full-stack BBS application built with TanStack Start, tRPC, and Drizzle. It uses SSR by default and integrates with better-auth for identity management.

## Stack

| Library         | Version  | Purpose                             |
| --------------- | -------- | ----------------------------------- |
| TanStack Start  | 1.167.42 | Full-stack framework                |
| TanStack Router | 1.168.23 | Type-safe routing                   |
| TanStack Query  | 5.99.2   | Async state & data fetching         |
| TanStack Form   | 1.29.0   | Type-safe form management           |
| tRPC            | 11.16.0  | End-to-end type-safe API            |
| arktype         | 2.2.0    | Runtime validation & type inference |
| better-auth     | 1.6.5    | Authentication                      |
| Drizzle ORM     | 0.45.2   | SQL ORM                             |
| PostgreSQL      | 3.4.9    | Database driver (Neon)              |
| Tailwind        | 4.2.2    | CSS utility framework               |
| React           | 19.2.5   | UI library                          |

---

# Directory Structure

| Path                | Description                                     |
| ------------------- | ----------------------------------------------- |
| `src/routes/`       | File-based routes (TanStack Router)             |
| `src/components/`   | Shared UI components (shadcn/ui, Radix)         |
| `src/integrations/` | External service glue (tRPC, Auth)              |
| `src/server/`       | Server-only logic (tRPC routers, procedures)    |
| `src/db/`           | Database schema, migrations, and Drizzle client |
| `src/lib/`          | Utility functions and core configuration        |

---

# Key Files

| File                                     | Purpose                                    |
| ---------------------------------------- | ------------------------------------------ |
| `src/router.tsx`                         | Router configuration and QueryClient setup |
| `src/routes/__root.tsx`                  | Global layout and provider wrapper         |
| `src/integrations/trpc/react.ts`         | Frontend tRPC hooks (`useTRPC`)            |
| `src/integrations/trpc/server.server.ts` | Server-side tRPC caller for SSR loaders    |
| `src/server/trpc/router.ts`              | Primary tRPC router definition             |
| `src/lib/auth.ts`                        | Server-side better-auth configuration      |
| `src/lib/auth-client.ts`                 | Client-side better-auth hooks              |
| `src/env.ts`                             | Environment variable validation (arktype)  |

---

# SSR Data-Fetching Rule

**CORE RULE**: Loaders must use `ensureQueryData` to prefetch data into the TanStack Query cache. Components must use `useQuery` with the same query options to read the hydrated data.

### Example (Query)

```tsx
// src/routes/index.tsx
export const Route = createFileRoute('/')({
  loader: async ({ context }) => {
    const serverTrpc = createServerTRPC(context.queryClient);
    // Prefetch into cache
    await context.queryClient.ensureQueryData(serverTrpc.demo.greet.queryOptions({ name: 'qa' }));
  },
  component: HomeComponent,
});

function HomeComponent() {
  const trpc = useTRPC();
  // Reads from hydrated cache
  const { data } = useQuery(trpc.demo.greet.queryOptions({ name: 'qa' }));
  return <h1>{data?.greeting}</h1>;
}
```

---

# Auth Pattern

Identity is managed via better-auth.

### Server-side (Protecting Routes)

Use `auth.api.getSession` within loaders to check for an active session.

```tsx
// src/routes/app.tsx
export const Route = createFileRoute('/app')({
  loader: async () => {
    const { getRequestHeaders } = await import('@tanstack/react-start/server');
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) {
      throw redirect({ to: '/login' });
    }
  },
});
```

### Client-side

Use `signIn`, `signOut`, and `useSession` from `@/lib/auth-client`.

```tsx
import { signIn, signOut, useSession } from '@/lib/auth-client';

// Login
await signIn.email({ email, password });

// Logout
await signOut();
```

---

# tRPC Pattern

### Defining Procedures

Add new procedures to the `appRouter` in `src/server/trpc/router.ts`.

```tsx
export const appRouter = router({
  demo: router({
    greet: publicProcedure
      .input(type({ name: 'string' }))
      .query(({ input }) => ({ greeting: `hello ${input.name}` })),
  }),
});
```

### Using Procedures

- **Client**: Use `useTRPC()` to access query/mutation options.
- **Server (Loaders)**: Use `createServerTRPC(queryClient)` to get server-side proxies.

---

# Commands

| Command              | Action                            |
| -------------------- | --------------------------------- |
| `yarn dev`           | Start dev server on port 3000     |
| `yarn build`         | Build for production              |
| `yarn typecheck`     | Run tsc --noEmit                  |
| `yarn db:push`       | Push schema changes to Neon       |
| `yarn db:studio`     | Open Drizzle Studio               |
| `yarn auth:generate` | Generate better-auth client types |

---

# Anti-Patterns

- **No Barrel Exports**: Never create `index.ts` files that re-export members.
- **No Direct Loader Returns**: Never return API data directly from a loader. Use `ensureQueryData`.
- **No Manual Headers**: Avoid manually constructing auth headers; use `getRequestHeaders()` or the auth-client.
- **No Inline SQL**: Use Drizzle for all database interactions.
- **No Zod**: Use `arktype` for all validation and type inference.

---

# Environment Variables

Refer to `.env.example` for required variables:

- `DATABASE_URL`: Pooled connection for runtime.
- `DATABASE_URL_DIRECT`: Direct connection for migrations.
- `BETTER_AUTH_SECRET`: 48-char random secret.
- `BETTER_AUTH_URL`: Base URL for callbacks (e.g., http://localhost:3000).
