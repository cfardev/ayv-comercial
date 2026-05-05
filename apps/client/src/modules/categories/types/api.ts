export interface Category {
	id: string;
	name: string;
	description: string | null;
	status: boolean;
	productCount: number;
	createdAt: string;
	updatedAt: string;
}

export interface CategoryFilters {
	search?: string;
	status?: "true" | "false" | "ALL";
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

export interface CreateCategoryPayload {
	name: string;
	description?: string;
}

export interface UpdateCategoryPayload {
	name?: string;
	description?: string;
}
