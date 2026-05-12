export interface Customer {
	id: string;
	personType: "NATURAL" | "JURIDICA";
	fullName: string;
	taxId: string;
	address: string | null;
	phone: string | null;
	email: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CustomerFilters {
	search?: string;
	personType?: "NATURAL" | "JURIDICA";
	isActive?: "true" | "false" | "ALL";
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

export interface CreateCustomerPayload {
	personType: "NATURAL" | "JURIDICA";
	fullName: string;
	taxId: string;
	address?: string;
	phone?: string;
	email?: string;
}

export interface UpdateCustomerPayload {
	personType?: "NATURAL" | "JURIDICA";
	fullName?: string;
	taxId?: string;
	address?: string;
	phone?: string;
	email?: string;
}
