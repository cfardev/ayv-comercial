export interface Supplier {
	id: string;
	name: string;
	taxId: string;
	contactName: string | null;
	phone: string | null;
	email: string | null;
	address: string | null;
	commercialConditions: string | null;
	status: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface SupplierFilters {
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

export interface CreateSupplierPayload {
	name: string;
	taxId: string;
	contactName?: string;
	phone?: string;
	email?: string;
	address?: string;
	commercialConditions?: string;
}

export interface UpdateSupplierPayload {
	name?: string;
	taxId?: string;
	contactName?: string;
	phone?: string;
	email?: string;
	address?: string;
	commercialConditions?: string;
}
