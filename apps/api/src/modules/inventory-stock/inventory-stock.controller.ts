import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import type { UserRole } from "../../../generated/prisma/client.js";
import { RequirePermissions } from "../../auth/decorators/require-permissions.decorator.js";
import { PermissionsGuard } from "../../auth/guards/permissions.guard.js";
import { PERMISSION_KEYS } from "../../auth/permissions/permission-keys.js";
import { getPermissionsForRole } from "../../auth/permissions/role-permissions.map.js";
import { ListStockDto } from "./dto/index.js";
import type { StockEntity } from "./entities/stock.entity.js";
import type {
	PaginatedResult,
	StockFilters,
} from "./interfaces/stock-filters.interface.js";
import { InventoryStockService } from "./inventory-stock.service.js";

function safeInt(value: string): number | undefined {
	const n = Number(value);
	return Number.isFinite(n) ? n : undefined;
}

interface AuthenticatedRequest extends Request {
	user: {
		userId: string;
		email: string;
		roleSlug: string;
	};
}

@Controller("inventory/stock")
@UseGuards(PermissionsGuard)
export class InventoryStockController {
	constructor(private readonly stockService: InventoryStockService) {}

	private canViewCost(req: AuthenticatedRequest): boolean {
		const role = req.user?.roleSlug as UserRole | undefined;
		if (!role) return false;
		const perms = getPermissionsForRole(role);
		return perms.includes(PERMISSION_KEYS.PRODUCTS_UPDATE);
	}

	private stripCost(entity: StockEntity): StockEntity {
		const { cost: _, ...rest } = entity;
		return rest as StockEntity;
	}

	@Get()
	@RequirePermissions(PERMISSION_KEYS.INVENTORY_STOCK_READ)
	async findAll(
		@Query() query: ListStockDto,
		@Req() req: AuthenticatedRequest,
	): Promise<PaginatedResult<StockEntity>> {
		const filters: StockFilters = {
			search: query.search,
			categoryId: query.categoryId,
			brandId: query.brandId,
			supplierId: query.supplierId,
			stockStatus: query.stockStatus as StockFilters["stockStatus"],
			isActive: query.isActive as StockFilters["isActive"],
			sortBy: query.sortBy,
			sortOrder: query.sortOrder as "asc" | "desc",
			page: query.page ? safeInt(query.page) : undefined,
			limit: query.limit ? safeInt(query.limit) : undefined,
		};

		const result = await this.stockService.findAll(filters);

		if (!this.canViewCost(req)) {
			return {
				...result,
				data: result.data.map((item) => this.stripCost(item)),
			};
		}

		return result;
	}

	@Get(":productId")
	@RequirePermissions(PERMISSION_KEYS.INVENTORY_STOCK_READ)
	async findOne(
		@Param("productId") productId: string,
		@Req() req: AuthenticatedRequest,
	): Promise<StockEntity> {
		const entity = await this.stockService.findOne(
			productId,
			this.canViewCost(req),
		);
		if (!this.canViewCost(req)) {
			return this.stripCost(entity);
		}
		return entity;
	}
}
