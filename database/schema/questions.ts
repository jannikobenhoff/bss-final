import { boolean, pgTable, text, timestamp, json } from "drizzle-orm/pg-core";

import { users } from "./auth";
import { relations } from "drizzle-orm";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { lections } from "./lections";

export const questions = pgTable("questions", {
	id: text("id").primaryKey(),
	lectionId: text("lection_id")
		.notNull()
		.references(() => lections.id, { onDelete: "cascade" }),
	questionText: text("question_text").notNull(),
	options: json("options").notNull(), // store as array of options
	correctAnswer: json("correct_answer").notNull(), // could be a string or array
	type: text("type").notNull(), // e.g., "multiple_choice", "drag_and_drop", etc.
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const questionsRelations = relations(questions, ({ one, many }) => ({
	lection: one(lections, {
		fields: [questions.lectionId],
		references: [lections.id],
	}),
}));

export const selectQuestionSchema = createSelectSchema(questions);
export type Question = z.infer<typeof selectQuestionSchema>;

export const insertQuestionSchema = createInsertSchema(questions, {
	questionText: (schema: z.ZodString) =>
		schema.nonempty("Question cannot be empty"),
});
