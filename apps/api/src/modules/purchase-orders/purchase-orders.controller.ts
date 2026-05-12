import {
	BadRequestException,
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
import {
	PurchaseOrderStatus,
	UserRole,
} from "../../../generated/prisma/client.js";
import { RequirePermissions } from "../../auth/decorators/require-permissions.decorator.js";
import { PermissionsGuard } from "../../auth/guards/permissions.guard.js";
import { PERMISSION_KEYS } from "../../auth/permissions/permission-keys.js";
import {
	CreatePurchaseOrderDto,
	ListPurchaseOrdersDto,
	ProductsBySupplierDto,
	UpdatePurchaseOrderStatusDto,
} from "./dto/index.js";
import type {
	PurchaseOrderEntity,
	PurchaseOrderItemEntity,
} from "./entities/purchase-order.entity.js";
import type {
	PaginatedResult,
	PurchaseOrderFilters,
	PurchaseOrderWithItems,
} from "./interfaces/purchase-order-filters.interface.js";
import { PurchaseOrdersService } from "./purchase-orders.service.js";

interface AuthenticatedRequest extends Request {
	user: {
		userId: string;
		email: string;
		roleSlug: string;
	};
}

@Controller("purchase-orders")
@UseGuards(PermissionsGuard)
export class PurchaseOrdersController {
	constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

	private canViewAmounts(req: AuthenticatedRequest): boolean {
		return (
			req.user?.roleSlug === UserRole.ADMIN ||
			req.user?.roleSlug === UserRole.INVENTORY_MANAGER
		);
	}

	private stripOrderAmounts<T extends PurchaseOrderEntity>(entity: T): T {
		const strippedItems: PurchaseOrderItemEntity[] | undefined =
			entity.items?.map((item) => ({
				...item,
				unitCost: undefined,
				subtotal: undefined,
			}));

		return {
			...entity,
			totalEstimated: undefined,
			items: strippedItems,
		};
	}

	@Get()
	@RequirePermissions(PERMISSION_KEYS.PURCHASE_ORDERS_READ)
	async findAll(
		@Query() query: ListPurchaseOrdersDto,
		@Req() req: AuthenticatedRequest,
	): Promise<PaginatedResult<PurchaseOrderEntity>> {
		const parsedStatus = query.status
			? query.status
					.split(",")
					.map((value) => value.trim())
					.filter((value) => value.length > 0)
					.map((value) => {
						if (!(value in PurchaseOrderStatus)) {
							throw new BadRequestException(`Invalid status filter: ${value}`);
						}
						return value as PurchaseOrderStatus;
					})
			: undefined;

		const filters: PurchaseOrderFilters = {
			search: query.search,
			status: parsedStatus,
			fromDate: query.fromDate,
			toDate: query.toDate,
			page: query.page ? Number(query.page) : undefined,
			limit: query.limit ? Number(query.limit) : undefined,
		};

		const result = await this.purchaseOrdersService.findAll(filters);
		if (!this.canViewAmounts(req)) {
			return {
				...result,
				data: result.data.map((item) => this.stripOrderAmounts(item)),
			};
		}

		return result;
	}

	@Get("products-by-supplier")
	@RequirePermissions(PERMISSION_KEYS.PURCHASE_ORDERS_READ)
	async findProductsBySupplier(
		@Query() query: ProductsBySupplierDto,
	): Promise<Array<{ id: string; name: string; cost: number }>> {
		return this.purchaseOrdersService.findProductsBySupplier(query.supplierId);
	}

	@Get(":id")
	@RequirePermissions(PERMISSION_KEYS.PURCHASE_ORDERS_READ)
	async findOne(
		@Param("id") id: string,
		@Req() req: AuthenticatedRequest,
	): Promise<PurchaseOrderWithItems> {
		const order = await this.purchaseOrdersService.findOne(id);
		if (!this.canViewAmounts(req)) {
			return this.stripOrderAmounts(order) as PurchaseOrderWithItems;
		}
		return order;
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@RequirePermissions(PERMISSION_KEYS.PURCHASE_ORDERS_CREATE)
	async create(
		@Body() dto: CreatePurchaseOrderDto,
		@Req() req: AuthenticatedRequest,
	): Promise<PurchaseOrderWithItems> {
		return this.purchaseOrdersService.create(dto, req.user.userId);
	}

	@Patch(":id/status")
	@RequirePermissions(PERMISSION_KEYS.PURCHASE_ORDERS_UPDATE)
	async updateStatus(
		@Param("id") id: string,
		@Body() dto: UpdatePurchaseOrderStatusDto,
		@Req() req: AuthenticatedRequest,
	): Promise<PurchaseOrderWithItems> {
		return this.purchaseOrdersService.updateStatus(id, dto, req.user.userId);
	}
}
