export class PriceHistoryEntity {
	id!: string;
	productId!: string;
	previousCost!: string;
	newCost!: string;
	previousSalePrice!: string;
	newSalePrice!: string;
	justification!: string | null;
	changedBy!: string;
	createdAt!: Date;
}

export interface UpdatePricingResult {
	product: {
		id: string;
		cost: string;
		price: string;
	};
	priceHistory: PriceHistoryEntity;
	warnings: {
		negativeMargin: boolean;
		largeVariation: boolean;
		variationPercent: number;
	};
}
