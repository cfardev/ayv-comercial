import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from "@nestjs/common";
import { CreateTodoDto } from "./dto/create-todo.dto.js";
import { UpdateTodoDto } from "./dto/update-todo.dto.js";
import { TodosService } from "./todos.service.js";

@Controller("todos")
export class TodosController {
	constructor(private readonly todosService: TodosService) {}

	@Get()
	findAll() {
		return this.todosService.findAll();
	}

	@Post()
	create(@Body() dto: CreateTodoDto) {
		return this.todosService.create(dto);
	}

	@Patch(":id")
	update(@Param("id") id: string, @Body() dto: UpdateTodoDto) {
		return this.todosService.update(id, dto);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.todosService.remove(id);
	}
}
