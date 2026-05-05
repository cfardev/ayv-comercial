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
import { BrandsService } from "./brands.service.js";
import { CreateBrandDto } from "./dto/create-brand.dto.js";
import { ListBrandsAdminDto } from "./dto/list-brands-admin.dto.js";
import { ListBrandsPickerDto } from "./dto/list-brands-picker.dto.js";
import { UpdateBrandDto } from "./dto/update-brand.dto.js";
import type { BrandEntity } from "./entities/brand.entity.js";
import type { BrandSummaryEntity } from "./entities/brand-summary.entity.js";
import type {
	BrandAdminFilters,
	PaginatedResult,
} from "./interfaces/brand-filters.interface.js";

interface AuthenticatedRequest extends Request {
	user: {
		userId: string;
		email: string;
	};
}

@Controller("brands")
@UseGuards(PermissionsGuard)
export class BrandsController {
	constructor(private readonly brandsService: BrandsService) {}

	@Get("picker")
	@RequirePermissions(PERMISSION_KEYS.PRODUCTS_READ)
	async findForPicker(
		@Query() query: ListBrandsPickerDto,
		@Req() req: AuthenticatedRequest,
	): Promise<BrandSummaryEntity[]> {
		void req;
		return this.brandsService.findForPicker({
			search: query.search,
			limit: query.limit,
		});
	}

	@Get()
	@RequirePermissions(PERMISSION_KEYS.BRANDS_READ)
	async findAll(
		@Query() query: ListBrandsAdminDto,
		@Req() req: AuthenticatedRequest,
	): Promise<PaginatedResult<BrandEntity>> {
		void req;
		const filters: BrandAdminFilters = {
			search: query.search,
			status: query.status as "true" | "false" | "ALL" | undefined,
			page: query.page ? Number(query.page) : undefined,
			limit: query.limit ? Number(query.limit) : undefined,
		};
		return this.brandsService.findAllAdmin(filters);
	}

	@Get(":id")
	@RequirePermissions(PERMISSION_KEYS.BRANDS_READ)
	async findOne(@Param("id") id: string): Promise<BrandEntity> {
		return this.brandsService.findOne(id);
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@RequirePermissions(PERMISSION_KEYS.BRANDS_CREATE)
	async create(
		@Body() dto: CreateBrandDto,
		@Req() req: AuthenticatedRequest,
	): Promise<BrandEntity> {
		return this.brandsService.create(dto, req.user.userId);
	}

	@Patch(":id")
	@RequirePermissions(PERMISSION_KEYS.BRANDS_UPDATE)
	async update(
		@Param("id") id: string,
		@Body() dto: UpdateBrandDto,
		@Req() req: AuthenticatedRequest,
	): Promise<BrandEntity> {
		return this.brandsService.update(id, dto, req.user.userId);
	}

	@Post(":id/deactivate")
	@HttpCode(HttpStatus.OK)
	@RequirePermissions(PERMISSION_KEYS.BRANDS_DEACTIVATE)
	async deactivate(
		@Param("id") id: string,
		@Req() req: AuthenticatedRequest,
	): Promise<BrandEntity> {
		return this.brandsService.deactivate(id, req.user.userId);
	}

	@Post(":id/reactivate")
	@HttpCode(HttpStatus.OK)
	@RequirePermissions(PERMISSION_KEYS.BRANDS_REACTIVATE)
	async reactivate(
		@Param("id") id: string,
		@Req() req: AuthenticatedRequest,
	): Promise<BrandEntity> {
		return this.brandsService.reactivate(id, req.user.userId);
	}
}
