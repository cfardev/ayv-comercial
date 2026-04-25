import { randomUUID } from "node:crypto";
import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateTodoDto } from "./dto/create-todo.dto.js";
import type { UpdateTodoDto } from "./dto/update-todo.dto.js";

type TodoItem = {
	id: string;
	title: string;
	done: boolean;
	createdAt: Date;
	updatedAt: Date;
};

@Injectable()
export class TodosService {
	private readonly todos = new Map<string, TodoItem>();

	findAll() {
		return [...this.todos.values()].sort(
			(a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
		);
	}

	create(dto: CreateTodoDto) {
		const now = new Date();
		const todo: TodoItem = {
			id: randomUUID(),
			title: dto.title,
			done: false,
			createdAt: now,
			updatedAt: now,
		};

		this.todos.set(todo.id, todo);

		return todo;
	}

	update(id: string, dto: UpdateTodoDto) {
		const currentTodo = this.todos.get(id);

		if (!currentTodo) {
			throw new NotFoundException();
		}

		const updatedTodo: TodoItem = {
			...currentTodo,
			...dto,
			updatedAt: new Date(),
		};

		this.todos.set(id, updatedTodo);

		return updatedTodo;
	}

	remove(id: string) {
		const currentTodo = this.todos.get(id);

		if (!currentTodo) {
			throw new NotFoundException();
		}

		this.todos.delete(id);

		return currentTodo;
	}
}
