import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const demoItems = pgTable('demo_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  label: text('label').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
