export interface CategoryFilters {
	search?: string;
	status?: "true" | "false" | "ALL";
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
