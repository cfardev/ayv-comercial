import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Query,
	Req,
	UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { RequirePermissions } from "../../auth/decorators/require-permissions.decorator.js";
import { PermissionsGuard } from "../../auth/guards/permissions.guard.js";
import { PERMISSION_KEYS } from "../../auth/permissions/permission-keys.js";
import {
	CreateInventoryEntryDto,
	ListInventoryEntriesDto,
} from "./dto/index.js";
import type { InventoryEntryEntity } from "./entities/inventory-entry.entity.js";
import type {
	InventoryEntryFilters,
	InventoryEntryWithItems,
	PaginatedResult,
} from "./interfaces/inventory-entry-filters.interface.js";
import { InventoryEntriesService } from "./inventory-entries.service.js";

interface AuthenticatedRequest extends Request {
	user: {
		userId: string;
		email: string;
		roleSlug: string;
	};
}

@Controller("inventory/entries")
@UseGuards(PermissionsGuard)
export class InventoryEntriesController {
	constructor(
		private readonly inventoryEntriesService: InventoryEntriesService,
	) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@RequirePermissions(PERMISSION_KEYS.INVENTORY_ENTRIES_CREATE)
	async create(
		@Body() dto: CreateInventoryEntryDto,
		@Req() req: AuthenticatedRequest,
	): Promise<InventoryEntryWithItems> {
		if (!dto.items?.length) {
			throw new BadRequestException(
				"La entrada debe tener al menos un producto con cantidad mayor a cero.",
			);
		}
		return this.inventoryEntriesService.create(dto, req.user.userId);
	}

	@Get()
	@RequirePermissions(PERMISSION_KEYS.INVENTORY_ENTRIES_READ)
	async findAll(
		@Query() query: ListInventoryEntriesDto,
	): Promise<PaginatedResult<InventoryEntryEntity>> {
		const filters: InventoryEntryFilters = {
			search: query.search,
			fromDate: query.fromDate,
			toDate: query.toDate,
			page: query.page ? Number(query.page) : undefined,
			limit: query.limit ? Number(query.limit) : undefined,
		};
		return this.inventoryEntriesService.findAll(filters);
	}

	@Get(":id")
	@RequirePermissions(PERMISSION_KEYS.INVENTORY_ENTRIES_READ)
	async findOne(@Param("id") id: string): Promise<InventoryEntryWithItems> {
		return this.inventoryEntriesService.findOne(id);
	}
}
