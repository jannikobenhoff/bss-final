"use server";

import { getSession } from "@/actions/auth";
import { db } from "@/database/db";
import { users } from "@/database/schema/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Removes a life from the user
 * @returns Object with success status and error message if applicable
 */
export async function removeLife(): Promise<{
	success: boolean;
	error: string | null;
}> {
	const session = await getSession();
	if (!session) {
		return { success: false, error: "Unauthorized" };
	}

	// Get current user
	const user = await db.query.users.findFirst({
		where: eq(users.id, session.user.id),
	});

	if (!user) {
		return { success: false, error: "User not found" };
	}

	// Check if user has lives to remove
	if (user.lives <= 0) {
		return { success: false, error: "No lives remaining" };
	}

	// Update user's lives
	const result = await db
		.update(users)
		.set({
			lives: user.lives - 1,
			livesUpdatedAt: new Date(),
		})
		.where(eq(users.id, session.user.id))
		.returning();

	if (result.length === 0) {
		return {
			success: false,
			error: "Failed to update user lives",
		};
	}

	// Revalidate relevant paths
	revalidatePath("/lections/[id]");
	revalidatePath("/statistic");

	return { success: true, error: null };
}
