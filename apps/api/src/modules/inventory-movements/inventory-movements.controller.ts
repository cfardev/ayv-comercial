import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import type { MovementType } from "../../../generated/prisma/client.js";
import { RequirePermissions } from "../../auth/decorators/require-permissions.decorator.js";
import { PermissionsGuard } from "../../auth/guards/permissions.guard.js";
import { PERMISSION_KEYS } from "../../auth/permissions/permission-keys.js";
import { ListInventoryMovementsDto } from "./dto/index.js";
import type { InventoryMovementEntity } from "./entities/inventory-movement.entity.js";
import type {
	InventoryMovementFilters,
	PaginatedResult,
} from "./interfaces/inventory-movement-filters.interface.js";
import { InventoryMovementsService } from "./inventory-movements.service.js";

interface AuthenticatedRequest extends Request {
	user: { userId: string; roleSlug?: string };
}

@Controller("inventory/movements")
@UseGuards(PermissionsGuard)
export class InventoryMovementsController {
	constructor(
		private readonly movementsService: InventoryMovementsService,
	) {}

	@Get()
	@RequirePermissions(PERMISSION_KEYS.INVENTORY_MOVEMENTS_READ)
	async findAll(
		@Query() query: ListInventoryMovementsDto,
		@Req() req: AuthenticatedRequest,
	): Promise<PaginatedResult<InventoryMovementEntity>> {
		const filters: InventoryMovementFilters = {
			movementType: query.movementType as MovementType | undefined,
			startDate: query.startDate,
			endDate: query.endDate,
			productId: query.productId,
			supplierId: query.supplierId,
			createdBy: query.createdBy,
			includeInactiveProducts: query.includeInactiveProducts === "true",
			sortBy: query.sortBy,
			sortOrder: query.sortOrder as "asc" | "desc",
			page: query.page ? Number(query.page) : undefined,
			limit: query.limit ? Number(query.limit) : undefined,
		};
		return this.movementsService.findAll(filters, req.user.userId);
	}

	@Get(":id")
	@RequirePermissions(PERMISSION_KEYS.INVENTORY_MOVEMENTS_READ)
	async findOne(
		@Param("id") id: string,
		@Req() req: AuthenticatedRequest,
	): Promise<InventoryMovementEntity> {
		return this.movementsService.findOne(id, req.user.userId);
	}
}
