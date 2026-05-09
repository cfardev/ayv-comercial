export interface ProductImage {
	id: string;
	url: string;
	fileKey: string | null;
	sortOrder: number;
	createdAt: string;
}

export interface Product {
	id: string;
	code: string;
	name: string;
	description: string | null;
	cost: string;
	price: string;
	status: boolean;
	categoryId: string;
	categoryName: string;
	brandId?: string | null;
	brandName?: string | null;
	unitOfMeasure: string | null;
	minimumStock: number;
	supplier: string | null;
	stockCurrent: number;
	images: ProductImage[];
	createdAt: string;
	updatedAt: string;
}

export interface ProductFilters {
	search?: string;
	status?: "true" | "false" | "ALL";
	categoryId?: string;
	brandId?: string;
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
	code: string;
	name: string;
	description?: string;
	cost: number;
	price: number;
	categoryId: string;
	images: ProductImagePayload[];
	brandMode: "existing" | "new";
	brandId?: string;
	newBrandName?: string;
	unitOfMeasure?: string;
	minimumStock?: number;
	supplier?: string;
}

export interface UpdateProductPayload {
	code?: string;
	name?: string;
	description?: string;
	cost?: number;
	price?: number;
	categoryId?: string;
	images?: ProductImagePayload[];
	brandMode?: "existing" | "new";
	brandId?: string;
	newBrandName?: string;
	unitOfMeasure?: string;
	minimumStock?: number;
	supplier?: string;
}
