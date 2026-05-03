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
import { RequirePermissions } from "../../auth/decorators/require-permissions.decorator.js";
import { PermissionsGuard } from "../../auth/guards/permissions.guard.js";
import { PERMISSION_KEYS } from "../../auth/permissions/permission-keys.js";
import { CreateUserDto } from "./dto/create-user.dto.js";
import { ListUsersDto } from "./dto/list-users.dto.js";
import { UpdateUserDto } from "./dto/update-user.dto.js";
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
		roleSlug: string;
		roleName: string;
	};
}

@Controller("users")
@UseGuards(PermissionsGuard)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	@RequirePermissions(PERMISSION_KEYS.USERS_CREATE)
	async create(
		@Body() dto: CreateUserDto,
		@Req() req: AuthenticatedRequest,
	): Promise<UserEntity> {
		return this.usersService.create(dto, req.user.userId);
	}

	@Get()
	@RequirePermissions(PERMISSION_KEYS.USERS_READ)
	async findAll(
		@Query() query: ListUsersDto,
	): Promise<PaginatedResult<UserEntity>> {
		const filters: UserFilters = {
			search: query.search,
			status: query.status as UserFilters["status"],
			role: query.role,
			page: Number(query.page) || 1,
			limit: Number(query.limit) || 20,
		};
		return this.usersService.findAll(filters);
	}

	@Get(":id/can-hard-delete")
	@RequirePermissions(PERMISSION_KEYS.USERS_READ)
	async canHardDelete(
		@Param("id") id: string,
	): Promise<{ canDelete: boolean }> {
		const canDelete = await this.usersService.canHardDelete(id);
		return { canDelete };
	}

	@Get(":id")
	@RequirePermissions(PERMISSION_KEYS.USERS_READ)
	async findOne(@Param("id") id: string): Promise<UserEntity> {
		return this.usersService.findOne(id);
	}

	@Patch(":id")
	@RequirePermissions(PERMISSION_KEYS.USERS_UPDATE)
	async update(
		@Param("id") id: string,
		@Body() dto: UpdateUserDto,
		@Req() req: AuthenticatedRequest,
	): Promise<UserEntity> {
		return this.usersService.update(id, dto, req.user.userId);
	}

	@Post(":id/deactivate")
	@HttpCode(HttpStatus.OK)
	@RequirePermissions(PERMISSION_KEYS.USERS_DEACTIVATE)
	async deactivate(
		@Param("id") id: string,
		@Req() req: AuthenticatedRequest,
	): Promise<UserEntity> {
		return this.usersService.deactivate(id, req.user.userId);
	}

	@Post(":id/reactivate")
	@HttpCode(HttpStatus.OK)
	@RequirePermissions(PERMISSION_KEYS.USERS_REACTIVATE)
	async reactivate(
		@Param("id") id: string,
		@Req() req: AuthenticatedRequest,
	): Promise<UserEntity> {
		return this.usersService.reactivate(id, req.user.userId);
	}

	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	@RequirePermissions(PERMISSION_KEYS.USERS_DELETE)
	async hardDelete(
		@Param("id") id: string,
		@Req() req: AuthenticatedRequest,
	): Promise<void> {
		return this.usersService.hardDelete(id, req.user.userId);
	}
}
