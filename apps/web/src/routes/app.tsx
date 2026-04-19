import { createServerFn } from '@tanstack/react-start';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { type } from 'arktype';
import { useTRPC } from '@/integrations/trpc/react';
import { signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const labelSchema = type({ label: 'string >= 1' });

const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  const { getRequestHeaders } = await import('@tanstack/react-start/server');
  const { auth } = await import('@/lib/auth');
  const headers = getRequestHeaders();

  return auth.api.getSession({ headers });
});

export const Route = createFileRoute('/app')({
  loader: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: '/login' });
    }
  },
  component: AppPage,
});

function AppPage() {
  const trpc = useTRPC();
  const submitMutation = useMutation(trpc.demo.submit.mutationOptions());

  const form = useForm({
    defaultValues: { label: '' },
    onSubmit: async ({ value }) => {
      await submitMutation.mutateAsync({ label: value.label });
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      <div className="w-full max-w-md flex justify-end">
        <Button data-testid="signout-btn" variant="outline" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Demo App</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            data-testid="app-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
            className="space-y-4"
          >
            <form.Field
              name="label"
              validators={{
                onChange: ({ value }) => {
                  if (!labelSchema.allows({ label: value })) {
                    return 'Label must be at least 1 character';
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Label</Label>
                  <Input
                    id={field.name}
                    data-testid="app-form-label"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors ? (
                    <p className="text-sm text-destructive">{field.state.meta.errors.join(', ')}</p>
                  ) : null}
                </div>
              )}
            </form.Field>

            <Button type="submit" data-testid="app-form-submit" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </form>

          {submitMutation.data && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <p data-testid="app-form-result" className="text-sm">
                {submitMutation.data.echoed}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
