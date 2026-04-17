import { IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Todo = {
	id: string;
	title: string;
	done: boolean;
	createdAt: string;
};

type UpdateTodoInput = {
	id: string;
	done: boolean;
};

const TODOS_QUERY_KEY = ["todos"] as const;

function getErrorMessage(error: unknown, fallback: string) {
	return error instanceof Error ? error.message : fallback;
}

async function parseJson<T>(res: Response): Promise<T> {
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || res.statusText);
	}
	return res.json() as Promise<T>;
}

async function fetchTodos(signal: AbortSignal) {
	return parseJson<Todo[]>(await fetch("/api/todos", { signal }));
}

async function createTodo(title: string) {
	return parseJson<Todo>(
		await fetch("/api/todos", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title }),
		}),
	);
}

async function updateTodo(input: UpdateTodoInput) {
	return parseJson<Todo>(
		await fetch(`/api/todos/${input.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ done: input.done }),
		}),
	);
}

async function removeTodo(id: string) {
	const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || res.statusText);
	}
}

export function DevTodoPage() {
	const queryClient = useQueryClient();
	const [title, setTitle] = useState("");

	const todosQuery = useQuery({
		queryKey: TODOS_QUERY_KEY,
		queryFn: ({ signal }) => fetchTodos(signal),
	});

	const addTodoMutation = useMutation({
		mutationKey: ["todos", "mutations", "add"],
		mutationFn: createTodo,
		onSuccess: async () => {
			setTitle("");
			await queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
		},
	});

	const toggleTodoMutation = useMutation({
		mutationKey: ["todos", "mutations", "toggle"],
		mutationFn: updateTodo,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
		},
	});

	const removeTodoMutation = useMutation({
		mutationKey: ["todos", "mutations", "remove"],
		mutationFn: removeTodo,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
		},
	});

	const errorMessage =
		(addTodoMutation.isError &&
			getErrorMessage(addTodoMutation.error, "Error al crear")) ||
		(toggleTodoMutation.isError &&
			getErrorMessage(toggleTodoMutation.error, "Error al actualizar")) ||
		(removeTodoMutation.isError &&
			getErrorMessage(removeTodoMutation.error, "Error al borrar")) ||
		(todosQuery.isError &&
			getErrorMessage(todosQuery.error, "Error al cargar")) ||
		null;

	function addTodo(e: FormEvent) {
		e.preventDefault();
		const nextTitle = title.trim();
		if (!nextTitle || addTodoMutation.isPending) return;
		addTodoMutation.mutate(nextTitle);
	}

	function toggleDone(todo: Todo) {
		if (toggleTodoMutation.isPending) return;
		toggleTodoMutation.mutate({ id: todo.id, done: !todo.done });
	}

	function remove(id: string) {
		if (removeTodoMutation.isPending) return;
		removeTodoMutation.mutate(id);
	}

	const todos = todosQuery.data ?? [];
	const isLoading = todosQuery.isPending;
	const isAdding = addTodoMutation.isPending;
	const isRefetching = todosQuery.isFetching && !todosQuery.isPending;

	return (
		<div className="mx-auto max-w-lg space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>TODO (dev)</CardTitle>
					<CardDescription>
						Lista persistente vía API — prueba crear, marcar y borrar.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<form onSubmit={addTodo} className="flex gap-2">
						<Input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Nueva tarea…"
							disabled={isAdding}
							autoComplete="off"
						/>
						<Button type="submit" disabled={isAdding || !title.trim()}>
							Añadir
						</Button>
					</form>

					{errorMessage ? (
						<p className="text-destructive text-sm">{errorMessage}</p>
					) : null}

					{isRefetching ? (
						<p className="text-muted-foreground text-sm">Actualizando…</p>
					) : null}

					{isLoading ? (
						<p className="text-muted-foreground text-sm">Cargando…</p>
					) : todos.length === 0 ? (
						<p className="text-muted-foreground text-sm">Sin tareas aún.</p>
					) : (
						<ul className="space-y-2">
							{todos.map((todo) => {
								const isTogglingTodo =
									toggleTodoMutation.isPending &&
									toggleTodoMutation.variables?.id === todo.id;
								const isRemovingTodo =
									removeTodoMutation.isPending &&
									removeTodoMutation.variables === todo.id;
								const isTodoPending = isTogglingTodo || isRemovingTodo;

								return (
									<li
										key={todo.id}
										className="flex items-center gap-3 rounded-md border p-2"
									>
										<input
											type="checkbox"
											checked={todo.done}
											onChange={() => void toggleDone(todo)}
											disabled={isTodoPending}
											className="size-4 shrink-0 accent-primary"
											aria-label={
												todo.done ? "Marcar pendiente" : "Marcar hecho"
											}
										/>
										<span
											className={
												todo.done
													? "flex-1 text-muted-foreground line-through"
													: "flex-1"
											}
										>
											{todo.title}
										</span>
										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											className="shrink-0 text-muted-foreground hover:text-destructive"
											onClick={() => void remove(todo.id)}
											disabled={isTodoPending}
											aria-label="Eliminar"
										>
											<IconTrash className="size-4" />
										</Button>
									</li>
								);
							})}
						</ul>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
