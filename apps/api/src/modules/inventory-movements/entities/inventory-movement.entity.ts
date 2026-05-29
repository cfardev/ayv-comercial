export class InventoryMovementEntity {
	id!: string;
	productId!: string;
	productCode!: string;
	productName!: string;
	supplierName?: string;
	type!: "ENTRY" | "EXIT" | "ADJUSTMENT";
	quantity!: number;
	previousQuantity!: number | null;
	newQuantity!: number | null;
	reason?: string | null;
	referenceId?: string | null;
	referenceType?: string | null;
	userId!: string;
	userFullName!: string;
	createdAt!: Date;
}
