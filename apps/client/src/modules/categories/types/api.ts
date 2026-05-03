export interface Category {
	id: string;
	name: string;
	description: string | null;
	status: boolean;
	parentId: string | null;
	depth: number;
	productCount: number;
	childrenCount: number;
	parent: { id: string; name: string } | null;
	createdAt: string;
	updatedAt: string;
}

export interface CategoryFilters {
	search?: string;
	parentId?: string;
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
	parentId?: string;
}

export interface UpdateCategoryPayload {
	name?: string;
	description?: string;
	parentId?: string | null;
}
