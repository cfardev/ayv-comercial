import { IconTrash } from "@tabler/icons-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
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

async function parseJson<T>(res: Response): Promise<T> {
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || res.statusText);
	}
	return res.json() as Promise<T>;
}

export function DevTodoPage() {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [title, setTitle] = useState("");
	const [pending, setPending] = useState(false);

	const load = useCallback(async () => {
		setError(null);
		try {
			const data = await parseJson<Todo[]>(await fetch("/api/todos"));
			setTodos(data);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Error al cargar");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	async function addTodo(e: FormEvent) {
		e.preventDefault();
		const t = title.trim();
		if (!t || pending) return;
		setPending(true);
		setError(null);
		try {
			await parseJson<Todo>(
				await fetch("/api/todos", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ title: t }),
				}),
			);
			setTitle("");
			await load();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error al crear");
		} finally {
			setPending(false);
		}
	}

	async function toggleDone(todo: Todo) {
		setError(null);
		try {
			await parseJson<Todo>(
				await fetch(`/api/todos/${todo.id}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ done: !todo.done }),
				}),
			);
			await load();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Error al actualizar");
		}
	}

	async function remove(id: string) {
		setError(null);
		try {
			const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || res.statusText);
			}
			await load();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Error al borrar");
		}
	}

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
							disabled={pending}
							autoComplete="off"
						/>
						<Button type="submit" disabled={pending || !title.trim()}>
							Añadir
						</Button>
					</form>

					{error ? <p className="text-destructive text-sm">{error}</p> : null}

					{loading ? (
						<p className="text-muted-foreground text-sm">Cargando…</p>
					) : todos.length === 0 ? (
						<p className="text-muted-foreground text-sm">Sin tareas aún.</p>
					) : (
						<ul className="space-y-2">
							{todos.map((todo) => (
								<li
									key={todo.id}
									className="flex items-center gap-3 rounded-md border p-2"
								>
									<input
										type="checkbox"
										checked={todo.done}
										onChange={() => void toggleDone(todo)}
										className="size-4 shrink-0 accent-primary"
										aria-label={todo.done ? "Marcar pendiente" : "Marcar hecho"}
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
										aria-label="Eliminar"
									>
										<IconTrash className="size-4" />
									</Button>
								</li>
							))}
						</ul>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
