export type StockStatus = "NORMAL" | "LOW" | "OUT_OF_STOCK";

export interface StockItem {
	id: string;
	code: string;
	name: string;
	categoryName: string;
	brandName: string | null;
	supplierName: string;
	currentStock: number;
	minStock: number;
	stockStatus: StockStatus;
	cost?: string;
	price: string;
	updatedAt: string;
}

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

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
