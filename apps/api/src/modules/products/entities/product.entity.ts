export interface ProductImageEntity {
	id: string;
	url: string;
	fileKey: string | null;
	sortOrder: number;
	createdAt: Date;
}

export class ProductEntity {
	id!: string;
	code!: string;
	name!: string;
	description!: string | null;
	cost!: string;
	price!: string;
	status!: boolean;
	categoryId!: string;
	categoryName!: string;
	brandId!: string | null;
	brandName!: string | null;
	supplierId!: string;
	supplierName!: string;
	unitOfMeasure!: string | null;
	minimumStock!: number;
	stockCurrent!: number;
	images!: ProductImageEntity[];
	createdAt!: Date;
	updatedAt!: Date;
}
