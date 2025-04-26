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
import { questions } from "./questions";
import { userLectionProgress } from "./userLectionProgress";

export const lections = pgTable("lections", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	levelRequired: integer("level_required").notNull().default(0),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	totalXp: integer("total_xp").notNull().default(0),
});

export const lectionsRelations = relations(lections, ({ many }) => ({
	questions: many(questions),
	userProgress: many(userLectionProgress),
}));

export const selectLectionSchema = createSelectSchema(lections);
export type Lection = z.infer<typeof selectLectionSchema>;

export const insertLectionSchema = createInsertSchema(lections, {
	title: (schema: z.ZodString) => schema.nonempty("Title cannot be empty"),
});
