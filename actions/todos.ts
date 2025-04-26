// "use server";

// import { and, eq } from "drizzle-orm";
// import { revalidatePath } from "next/cache";

// import { db } from "@/database/db";
// import { todos } from "@/database/schema";
// import { getSession } from "./auth";

// export async function createTodo(
// 	formData: FormData
// ): Promise<{ error: string | null; success: boolean }> {
// 	const session = await getSession();
// 	if (!session) {
// 		return { error: "Unauthorized", success: false };
// 	}
// 	await new Promise((resolve) => setTimeout(resolve, 200));
// 	const title = formData.get("title") as string;

// 	if (!title || title.trim() === "") {
// 		return { error: "Title is required", success: false };
// 	}

// 	const newTodo = await db
// 		.insert(todos)
// 		.values({
// 			title,
// 			userId: session.user.id,
// 		})
// 		.returning();

// 	revalidatePath("/todos");

// 	return { success: true, error: null };
// }

// export async function toggleTodo(
// 	todoId: string,
// 	completed: boolean
// ): Promise<{ success: boolean; error: string | null }> {
// 	const session = await getSession();
// 	if (!session) {
// 		return { success: false, error: "Unauthorized" };
// 	}

// 	// Use a single DB query that both checks ownership and updates the todo
// 	// The query will only update if the todo belongs to the current user
// 	const result = await db
// 		.update(todos)
// 		.set({ completed: !completed })
// 		.where(and(eq(todos.id, todoId), eq(todos.userId, session.user.id)))
// 		.returning();

// 	// If no rows were updated, it means the todo doesn't exist or doesn't belong to the user
// 	if (result.length === 0) {
// 		return {
// 			success: false,
// 			error: "Todo not found or you don't have permission to modify it",
// 		};
// 	}

// 	revalidatePath("/todos");

// 	return { success: true, error: null };
// }

// export async function deleteTodo(formData: FormData): Promise<void> {
// 	const session = await getSession();
// 	if (!session) {
// 		return; //{ success: false, error: "Unauthorized" };
// 	}

// 	// Check if role is admin
// 	if (session.user.role !== "admin") {
// 		return; //{ success: false, error: "Unauthorized" };
// 	}

// 	const id = formData.get("id") as string;
// 	await db.delete(todos).where(eq(todos.id, id));

// 	revalidatePath("/admin");
// }
