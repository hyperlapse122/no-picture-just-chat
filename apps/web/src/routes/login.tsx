import { useEffect, useRef, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
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
  const [authError, setAuthError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = async () => {
    if (isSubmitting || !formRef.current) {
      return;
    }

    const formData = new FormData(formRef.current);
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    if (!loginSchema.allows({ email, password })) {
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const { error } = await signIn.email({
        email,
        password,
        callbackURL: '/app',
      });

      if (error) {
        setAuthError(error.message ?? 'Login failed');
        return;
      }

      window.location.assign('/app');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void handleLogin();
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
                    disabled={!isHydrated || isSubmitting}
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
                    disabled={!isHydrated || isSubmitting}
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

            <Button
              type="button"
              data-testid="login-submit"
              disabled={!isHydrated || isSubmitting}
              className="mt-2"
              onClick={() => void handleLogin()}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
