import { pgTable, timestamp, text } from "drizzle-orm/pg-core";

import { users } from "./auth";
import { relations } from "drizzle-orm";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userActivity = pgTable("user_activity", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userActivityRelations = relations(userActivity, ({ one }) => ({
	user: one(users, {
		fields: [userActivity.userId],
		references: [users.id],
	}),
}));

export const selectUserActivitySchema = createSelectSchema(userActivity);
export type UserActivity = z.infer<typeof selectUserActivitySchema>;

export const insertUserActivitySchema = createInsertSchema(userActivity);
