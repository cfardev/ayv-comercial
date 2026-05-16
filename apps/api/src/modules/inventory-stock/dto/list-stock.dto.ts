import { IsIn, IsNumberString, IsOptional, IsString } from "class-validator";

const VALID_SORT_ORDERS = ["asc", "desc"] as const;

const VALID_SORT_FIELDS = [
	"code",
	"name",
	"categoryName",
	"brandName",
	"supplierName",
	"currentStock",
	"minStock",
	"stockStatus",
	"updatedAt",
] as const;

export class ListStockDto {
	@IsOptional()
	@IsString()
	search?: string;

	@IsOptional()
	@IsString()
	categoryId?: string;

	@IsOptional()
	@IsString()
	brandId?: string;

	@IsOptional()
	@IsString()
	supplierId?: string;

	@IsOptional()
	@IsString()
	stockStatus?: string;

	@IsOptional()
	@IsString()
	isActive?: string;

	@IsOptional()
	@IsIn([...VALID_SORT_FIELDS])
	sortBy?: string;

	@IsOptional()
	@IsIn([...VALID_SORT_ORDERS])
	sortOrder?: string;

	@IsOptional()
	@IsNumberString()
	page?: string;

	@IsOptional()
	@IsNumberString()
	limit?: string;
}
