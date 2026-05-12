import type { PurchaseOrderStatus } from "../../../../generated/prisma/client.js";
import type { PurchaseOrderEntity } from "../entities/purchase-order.entity.js";

export interface PurchaseOrderFilters {
	search?: string;
	status?: PurchaseOrderStatus[];
	fromDate?: string;
	toDate?: string;
	page?: number;
	limit?: number;
}

export interface PaginatedResult<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface PurchaseOrderWithItems extends PurchaseOrderEntity {
	items: NonNullable<PurchaseOrderEntity["items"]>;
}
