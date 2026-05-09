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
import { CreateSupplierDto } from "./dto/create-supplier.dto.js";
import { ListSuppliersDto } from "./dto/list-suppliers.dto.js";
import { UpdateSupplierDto } from "./dto/update-supplier.dto.js";
import type { SupplierEntity } from "./entities/supplier.entity.js";
import type {
	PaginatedResult,
	SupplierFilters,
} from "./interfaces/supplier-filters.interface.js";
import { SuppliersService } from "./suppliers.service.js";

interface AuthenticatedRequest extends Request {
	user: {
		userId: string;
		email: string;
	};
}

@Controller("suppliers")
@UseGuards(PermissionsGuard)
export class SuppliersController {
	constructor(private readonly suppliersService: SuppliersService) {}

	@Get()
	@RequirePermissions(PERMISSION_KEYS.SUPPLIERS_READ)
	async findAll(
		@Query() query: ListSuppliersDto,
	): Promise<PaginatedResult<SupplierEntity>> {
		const filters: SupplierFilters = {
			search: query.search,
			status: query.status as "true" | "false" | "ALL" | undefined,
			page: query.page ? Number(query.page) : undefined,
			limit: query.limit ? Number(query.limit) : undefined,
		};

		return this.suppliersService.findAll(filters);
	}

	@Get(":id")
	@RequirePermissions(PERMISSION_KEYS.SUPPLIERS_READ)
	async findOne(@Param("id") id: string): Promise<SupplierEntity> {
		return this.suppliersService.findOne(id);
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@RequirePermissions(PERMISSION_KEYS.SUPPLIERS_CREATE)
	async create(
		@Body() dto: CreateSupplierDto,
		@Req() req: AuthenticatedRequest,
	): Promise<SupplierEntity> {
		return this.suppliersService.create(dto, req.user.userId);
	}

	@Patch(":id")
	@RequirePermissions(PERMISSION_KEYS.SUPPLIERS_UPDATE)
	async update(
		@Param("id") id: string,
		@Body() dto: UpdateSupplierDto,
		@Req() req: AuthenticatedRequest,
	): Promise<SupplierEntity> {
		return this.suppliersService.update(id, dto, req.user.userId);
	}

	@Post(":id/deactivate")
	@HttpCode(HttpStatus.OK)
	@RequirePermissions(PERMISSION_KEYS.SUPPLIERS_DEACTIVATE)
	async deactivate(
		@Param("id") id: string,
		@Req() req: AuthenticatedRequest,
	): Promise<SupplierEntity> {
		return this.suppliersService.deactivate(id, req.user.userId);
	}

	@Post(":id/reactivate")
	@HttpCode(HttpStatus.OK)
	@RequirePermissions(PERMISSION_KEYS.SUPPLIERS_REACTIVATE)
	async reactivate(
		@Param("id") id: string,
		@Req() req: AuthenticatedRequest,
	): Promise<SupplierEntity> {
		return this.suppliersService.reactivate(id, req.user.userId);
	}
}
