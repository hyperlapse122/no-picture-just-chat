import { createAuthClient } from 'better-auth/react';

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
  // baseURL defaults to current origin in browser; explicit for SSR clarity
  baseURL: typeof window === 'undefined' ? undefined : window.location.origin,
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
