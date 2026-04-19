import { useState } from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { type } from 'arktype';

import { signIn } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = type({
  email: 'string.email',
  password: 'string >= 8',
});

export const Route = createFileRoute('/login')({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setAuthError(null);
      const result = await signIn.email({
        email: value.email,
        password: value.password,
      });

      if (result.error) {
        setAuthError(result.error.message ?? 'Login failed');
      } else {
        router.navigate({ to: '/app' });
      }
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="flex flex-col gap-4"
          >
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  const result = loginSchema.pick('email').allows({ email: value });
                  return result ? undefined : 'Invalid email address';
                },
              }}
            >
              {(field) => (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    data-testid="login-email"
                    type="email"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => {
                  const result = loginSchema.pick('password').allows({ password: value });
                  return result ? undefined : 'Password must be at least 8 characters';
                },
              }}
            >
              {(field) => (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    data-testid="login-password"
                    type="password"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            {authError && (
              <div className="text-sm text-destructive font-medium p-2 bg-destructive/10 rounded-md">
                {authError}
              </div>
            )}

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  data-testid="login-submit"
                  disabled={!canSubmit || isSubmitting}
                  className="mt-2"
                >
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
