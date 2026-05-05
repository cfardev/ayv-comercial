export interface BrandAdminFilters {
	search?: string;
	/** Defaults to `"true"` (active only) when omitted. */
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
