import { type } from 'arktype';
import { publicProcedure, router } from './init';

const greetInput = type({ name: 'string' });
const submitInput = type({ label: 'string >= 1' });

export const appRouter = router({
  demo: router({
    greet: publicProcedure
      .input(greetInput)
      .query(({ input }) => ({ greeting: `hello ${input.name}` })),

    submit: publicProcedure
      .input(submitInput)
      .mutation(({ input }) => ({ ok: true as const, echoed: input.label })),
  }),
});

export type AppRouter = typeof appRouter;
