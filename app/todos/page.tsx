import { TodoList } from "@/components/TodoList"
import { todos as todosTable, Todo } from "@/database/schema"
import { getSession } from "@/actions/auth"
import { db } from "@/database/db";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function TodosPage() {
    const session = await getSession();

    if (!session) {
        redirect("/auth/sign-in");
    }

    const todos: Todo[] = await db.query.todos.findMany({
        where: eq(todosTable.userId, session!.user.id),
    });

    return (
        <main className="py-8 px-4">
            <section className="container mx-auto">
                <h1 className="text-2xl font-bold mb-6">My Todos</h1>
                <TodoList todos={todos} />
            </section>
        </main>
    )
} 