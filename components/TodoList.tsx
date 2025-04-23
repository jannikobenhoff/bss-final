"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Todo } from "@/database/schema"

import { TodoItem } from "./TodoItem"
import { useActionState, useState, useEffect, useOptimistic } from "react";
import { createTodo } from "@/actions/todos";
import { toast } from "sonner";

export function TodoList({ todos }: { todos: Todo[] }) {
    const [title, setTitle] = useState("");

    // Use useActionState to track the action state
    const [state, formAction, isPending] = useActionState(
        async (prevState: { error: string | null; success: boolean }, formData: FormData) => {
            return await createTodo(formData);
        },
        {
            error: null,
            success: false
        }
    );

    const [optimisticTodos, addOptimisticTodo] = useOptimistic(
        todos, 
        (prevTodos: Todo[], updatedTodo: Todo) => {
            return [...prevTodos, updatedTodo];
        }
    );

    const handleSubmit = (formData: FormData) => {
        addOptimisticTodo({
            id: "0",
            title: formData.get("title") as string,
            completed: false,
            userId: "1",
            createdAt: new Date(),
            updatedAt: new Date()
        });

        formAction(formData);
    }

    useEffect(() => {
        if (state.success) {
            setTitle("");
            toast.success("Todo added successfully");
        }
        if (state.error) {
            toast.error(state.error);
        }
    }, [state]);

    return (
        <div className="space-y-4">
            <form className="flex gap-2 items-stretch" action={handleSubmit}>
                <div className="flex-1 space-y-1">
                    <Input
                        name="title"
                        placeholder={"Add a new todo..."}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    {state.error && (
                        <p className="text-sm text-red-500">{state.error}</p>
                    )}
                </div>
                <Button 
                    type="submit" 
                    disabled={isPending}
                >
                    {isPending ? "Adding..." : "Add"}
                </Button>
            </form>

            <ul className="space-y-2">
                {optimisticTodos.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} />
                ))}
            </ul>
        </div>
    )
} 