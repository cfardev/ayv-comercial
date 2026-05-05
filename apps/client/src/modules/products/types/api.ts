export interface ProductImage {
	id: string;
	url: string;
	fileKey: string | null;
	sortOrder: number;
	createdAt: string;
}

export interface Product {
	id: string;
	name: string;
	description: string | null;
	cost: string;
	price: string;
	status: boolean;
	categoryId: string;
	categoryName: string;
	brandId?: string | null;
	brandName?: string | null;
	images: ProductImage[];
	createdAt: string;
	updatedAt: string;
}

export interface ProductFilters {
	search?: string;
	status?: "true" | "false" | "ALL";
	categoryId?: string;
	minPrice?: number;
	maxPrice?: number;
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

export interface ProductImagePayload {
	url: string;
	fileKey?: string;
	sortOrder?: number;
}

export interface CreateProductPayload {
	name: string;
	description?: string;
	cost: number;
	price: number;
	categoryId: string;
	images: ProductImagePayload[];
	brandMode: "existing" | "new";
	brandId?: string;
	newBrandName?: string;
}

export interface UpdateProductPayload {
	name?: string;
	description?: string;
	cost?: number;
	price?: number;
	categoryId?: string;
	images?: ProductImagePayload[];
	brandMode?: "existing" | "new";
	brandId?: string;
	newBrandName?: string;
}
