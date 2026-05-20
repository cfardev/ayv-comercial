import type { MovementType } from "../../../../generated/prisma/client.js";

export interface InventoryMovementFilters {
	movementType?: MovementType;
	startDate?: string;
	endDate?: string;
	productId?: string;
	supplierId?: string;
	createdBy?: string;
	includeInactiveProducts?: boolean;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
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
