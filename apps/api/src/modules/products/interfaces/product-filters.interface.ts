export interface ProductFilters {
	search?: string;
	status?: "true" | "false" | "ALL";
	categoryId?: string;
	minPrice?: number;
	maxPrice?: number;
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
