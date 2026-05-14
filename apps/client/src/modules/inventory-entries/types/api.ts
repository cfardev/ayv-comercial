export interface InventoryEntryItem {
	id: string;
	productId: string;
	productName: string;
	productCode: string;
	quantityReceived: number;
	lotNumber: string | null;
	expirationDate: string | null;
}

export interface InventoryEntry {
	id: string;
	entryNumber: string;
	purchaseOrderId: string;
	referenceNumber: string;
	supplierName: string;
	entryDate: string;
	notes: string | null;
	createdBy: string;
	creatorName: string;
	createdAt: string;
	items?: InventoryEntryItem[];
}

export interface InventoryEntryFilters {
	search?: string;
	fromDate?: string;
	toDate?: string;
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

export interface CreateInventoryEntryPayload {
	purchaseOrderId: string;
	entryDate?: string;
	notes?: string;
	items: Array<{
		productId: string;
		quantityReceived: number;
		lotNumber?: string;
		expirationDate?: string;
	}>;
}
