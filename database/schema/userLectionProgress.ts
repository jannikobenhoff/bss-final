import {
	boolean,
	pgTable,
	text,
	timestamp,
	integer,
} from "drizzle-orm/pg-core";

import { users } from "./auth";
import { relations } from "drizzle-orm";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { lections } from "./lections";

export const userLectionProgress = pgTable("user_lection_progress", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	lectionId: text("lection_id")
		.notNull()
		.references(() => lections.id, { onDelete: "cascade" }),
	completed: boolean("completed").notNull().default(false),
});

export const userLectionProgressRelations = relations(
	userLectionProgress,
	({ one }) => ({
		user: one(users, {
			fields: [userLectionProgress.userId],
			references: [users.id],
		}),
		lection: one(lections, {
			fields: [userLectionProgress.lectionId],
			references: [lections.id],
		}),
	})
);

export const selectUserLectionProgressSchema =
	createSelectSchema(userLectionProgress);
export type UserLectionProgress = z.infer<
	typeof selectUserLectionProgressSchema
>;

export const insertUserLectionProgressSchema =
	createInsertSchema(userLectionProgress);
