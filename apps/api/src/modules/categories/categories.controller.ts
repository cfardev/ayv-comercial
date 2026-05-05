import {
	Body,
	Controller,
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
import { CategoriesService } from "./categories.service.js";
import { CreateCategoryDto } from "./dto/create-category.dto.js";
import { ListCategoriesDto } from "./dto/list-categories.dto.js";
import { UpdateCategoryDto } from "./dto/update-category.dto.js";
import type { CategoryEntity } from "./entities/category.entity.js";
import type { PaginatedResult } from "./interfaces/category-filters.interface.js";

interface AuthenticatedRequest extends Request {
	user: {
		userId: string;
		email: string;
	};
}

@Controller("categories")
@UseGuards(PermissionsGuard)
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) {}

	@Get()
	@RequirePermissions(PERMISSION_KEYS.CATEGORIES_READ)
	async findAll(
		@Query() query: ListCategoriesDto,
		@Req() req: AuthenticatedRequest,
	): Promise<PaginatedResult<CategoryEntity>> {
		void req;
		return this.categoriesService.findAll({
			search: query.search,
			status: query.status as "true" | "false" | "ALL" | undefined,
			page: query.page ? Number(query.page) : undefined,
			limit: query.limit ? Number(query.limit) : undefined,
		});
	}

	@Get(":id")
	@RequirePermissions(PERMISSION_KEYS.CATEGORIES_READ)
	async findOne(@Param("id") id: string): Promise<CategoryEntity> {
		return this.categoriesService.findOne(id);
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@RequirePermissions(PERMISSION_KEYS.CATEGORIES_CREATE)
	async create(
		@Body() dto: CreateCategoryDto,
		@Req() req: AuthenticatedRequest,
	): Promise<CategoryEntity> {
		return this.categoriesService.create(dto, req.user.userId);
	}

	@Patch(":id")
	@RequirePermissions(PERMISSION_KEYS.CATEGORIES_UPDATE)
	async update(
		@Param("id") id: string,
		@Body() dto: UpdateCategoryDto,
		@Req() req: AuthenticatedRequest,
	): Promise<CategoryEntity> {
		return this.categoriesService.update(id, dto, req.user.userId);
	}

	@Post(":id/deactivate")
	@HttpCode(HttpStatus.OK)
	@RequirePermissions(PERMISSION_KEYS.CATEGORIES_DEACTIVATE)
	async deactivate(
		@Param("id") id: string,
		@Req() req: AuthenticatedRequest,
	): Promise<CategoryEntity> {
		return this.categoriesService.deactivate(id, req.user.userId);
	}

	@Post(":id/reactivate")
	@HttpCode(HttpStatus.OK)
	@RequirePermissions(PERMISSION_KEYS.CATEGORIES_REACTIVATE)
	async reactivate(
		@Param("id") id: string,
		@Req() req: AuthenticatedRequest,
	): Promise<CategoryEntity> {
		return this.categoriesService.reactivate(id, req.user.userId);
	}
}
