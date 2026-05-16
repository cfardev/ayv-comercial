import type { StockStatus } from "../interfaces/stock-filters.interface.js";

export class StockEntity {
	id!: string;
	code!: string;
	name!: string;
	categoryName!: string;
	brandName!: string | null;
	supplierName!: string;
	currentStock!: number;
	minStock!: number;
	stockStatus!: StockStatus;
	cost?: string;
	price!: string;
	updatedAt!: Date;
}
