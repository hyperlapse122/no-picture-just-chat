import { serve } from '@hono/node-server';
import handler from './dist/server/server.js';

const port = Number(process.env.PORT ?? 3000);
serve({ fetch: handler.fetch, port }, () => {
  console.log(`Server running on http://localhost:${port}`);
});
