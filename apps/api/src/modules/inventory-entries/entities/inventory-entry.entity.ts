export interface InventoryEntryItemEntity {
	id: string;
	productId: string;
	productName: string;
	productCode: string;
	quantityReceived: number;
	lotNumber: string | null;
	expirationDate: Date | null;
}

export interface InventoryEntryEntity {
	id: string;
	entryNumber: string;
	purchaseOrderId: string;
	referenceNumber: string;
	supplierName: string;
	entryDate: Date;
	notes: string | null;
	createdBy: string;
	creatorName: string;
	createdAt: Date;
	items?: InventoryEntryItemEntity[];
}
