export type StockStatus = "NORMAL" | "LOW" | "OUT_OF_STOCK";

export interface StockFilters {
	search?: string;
	categoryId?: string;
	brandId?: string;
	supplierId?: string;
	stockStatus?: StockStatus;
	isActive?: "true" | "false" | "all";
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
