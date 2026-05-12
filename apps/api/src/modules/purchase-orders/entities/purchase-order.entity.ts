import type { PurchaseOrderStatus } from "../../../../generated/prisma/client.js";

export interface PurchaseOrderItemEntity {
	id: string;
	productId: string;
	productName: string;
	quantityOrdered: number;
	unitCost?: number;
	subtotal?: number;
}

export interface PurchaseOrderEntity {
	id: string;
	supplierId: string;
	supplierName: string;
	referenceNumber: string;
	estimatedReceiptDate: Date | null;
	paymentTerms: string | null;
	notes: string | null;
	status: PurchaseOrderStatus;
	totalEstimated?: number;
	createdBy: string;
	createdAt: Date;
	updatedAt: Date;
	items?: PurchaseOrderItemEntity[];
}
