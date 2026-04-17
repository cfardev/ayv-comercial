import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service.js";
import { Prisma } from "../generated/prisma/client.js";
import type { CreateTodoDto } from "./dto/create-todo.dto.js";
import type { UpdateTodoDto } from "./dto/update-todo.dto.js";

@Injectable()
export class TodosService {
	constructor(private readonly prisma: PrismaService) {}

	findAll() {
		return this.prisma.todo.findMany({
			orderBy: { createdAt: "desc" },
		});
	}

	create(dto: CreateTodoDto) {
		return this.prisma.todo.create({
			data: { title: dto.title },
		});
	}

	async update(id: string, dto: UpdateTodoDto) {
		try {
			return await this.prisma.todo.update({
				where: { id },
				data: dto,
			});
		} catch (e) {
			if (
				e instanceof Prisma.PrismaClientKnownRequestError &&
				e.code === "P2025"
			) {
				throw new NotFoundException();
			}
			throw e;
		}
	}

	async remove(id: string) {
		try {
			return await this.prisma.todo.delete({
				where: { id },
			});
		} catch (e) {
			if (
				e instanceof Prisma.PrismaClientKnownRequestError &&
				e.code === "P2025"
			) {
				throw new NotFoundException();
			}
			throw e;
		}
	}
}
