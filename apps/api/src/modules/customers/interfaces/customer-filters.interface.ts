export interface CustomerFilters {
	search?: string;
	personType?: "NATURAL" | "JURIDICA";
	isActive?: "true" | "false" | "ALL";
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
