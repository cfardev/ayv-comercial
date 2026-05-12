export type PurchaseOrderStatus =
	| "PENDING"
	| "SENT"
	| "PARTIAL"
	| "RECEIVED"
	| "CANCELLED";

export interface PurchaseOrderItem {
	id: string;
	productId: string;
	productName: string;
	quantityOrdered: number;
	unitCost?: number;
	subtotal?: number;
}

export interface PurchaseOrder {
	id: string;
	supplierId: string;
	supplierName: string;
	referenceNumber: string;
	estimatedReceiptDate: string | null;
	paymentTerms: string | null;
	notes: string | null;
	status: PurchaseOrderStatus;
	totalEstimated?: number;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
	items?: PurchaseOrderItem[];
}

export interface PurchaseOrderFilters {
	search?: string;
	status?: PurchaseOrderStatus[];
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

export interface SupplierLite {
	id: string;
	name: string;
}

export interface SupplierProductLite {
	id: string;
	name: string;
	cost: number;
}

export interface CreatePurchaseOrderPayload {
	supplierId: string;
	estimatedReceiptDate?: string;
	paymentTerms?: string;
	notes?: string;
	items: Array<{
		productId: string;
		quantityOrdered: number;
		unitCost: number;
	}>;
}
