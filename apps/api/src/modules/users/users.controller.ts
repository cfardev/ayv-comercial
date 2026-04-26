import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard.js";
import { RolesGuard } from "../../auth/guards/roles.guard.js";
import type { CreateUserDto } from "./dto/create-user.dto.js";
import { ListUsersDto } from "./dto/list-users.dto.js";
import type { UpdateUserDto } from "./dto/update-user.dto.js";
import type { UserEntity } from "./entities/user.entity.js";
import type {
	PaginatedResult,
	UserFilters,
} from "./interfaces/user-filters.interface.js";
import { UsersService } from "./users.service.js";

interface AuthenticatedRequest extends Request {
	user: {
		userId: string;
		email: string;
		roleName: string;
	};
}

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	async create(
		@Body() dto: CreateUserDto,
		@Req() req: AuthenticatedRequest,
	): Promise<UserEntity> {
		return this.usersService.create(dto, req.user.userId);
	}

	@Get()
	async findAll(
		@Query() query: ListUsersDto,
	): Promise<PaginatedResult<UserEntity>> {
		const filters: UserFilters = {
			search: query.search,
			status: query.status as UserFilters["status"],
			roleId: query.roleId,
			page: Number(query.page) || 1,
			limit: Number(query.limit) || 20,
		};
		return this.usersService.findAll(filters);
	}

	@Get(":id")
	async findOne(@Param("id") id: string): Promise<UserEntity> {
		return this.usersService.findOne(id);
	}

	@Patch(":id")
	async update(
		@Param("id") id: string,
		@Body() dto: UpdateUserDto,
		@Req() req: AuthenticatedRequest,
	): Promise<UserEntity> {
		return this.usersService.update(id, dto, req.user.userId);
	}

	@Post(":id/deactivate")
	@HttpCode(HttpStatus.OK)
	async deactivate(
		@Param("id") id: string,
		@Req() req: AuthenticatedRequest,
	): Promise<UserEntity> {
		return this.usersService.deactivate(id, req.user.userId);
	}

	@Post(":id/reactivate")
	@HttpCode(HttpStatus.OK)
	async reactivate(
		@Param("id") id: string,
		@Req() req: AuthenticatedRequest,
	): Promise<UserEntity> {
		return this.usersService.reactivate(id, req.user.userId);
	}

	@Get(":id/can-hard-delete")
	async canHardDelete(
		@Param("id") id: string,
	): Promise<{ canDelete: boolean }> {
		const canDelete = await this.usersService.canHardDelete(id);
		return { canDelete };
	}

	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	async hardDelete(
		@Param("id") id: string,
		@Req() req: AuthenticatedRequest,
	): Promise<void> {
		return this.usersService.hardDelete(id, req.user.userId);
	}
}
