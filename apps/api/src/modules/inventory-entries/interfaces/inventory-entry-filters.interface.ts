import type { InventoryEntryEntity } from "../entities/inventory-entry.entity.js";

export interface InventoryEntryFilters {
	search?: string;
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

export interface InventoryEntryWithItems extends InventoryEntryEntity {
	items: NonNullable<InventoryEntryEntity["items"]>;
}
