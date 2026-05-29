export type MovementType = "ENTRY" | "EXIT" | "ADJUSTMENT";

export interface InventoryMovement {
	id: string;
	productId: string;
	productCode: string;
	productName: string;
	supplierName?: string;
	type: MovementType;
	quantity: number;
	previousQuantity: number | null;
	newQuantity: number | null;
	reason?: string | null;
	referenceId?: string | null;
	referenceType?: string | null;
	userId: string;
	userFullName: string;
	createdAt: string;
}

export interface InventoryMovementFilters {
	movementType?: MovementType;
	startDate?: string;
	endDate?: string;
	productId?: string;
	supplierId?: string;
	createdBy?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
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
