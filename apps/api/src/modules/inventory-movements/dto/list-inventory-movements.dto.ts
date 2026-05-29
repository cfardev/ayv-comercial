import {
	IsBooleanString,
	IsIn,
	IsNumberString,
	IsOptional,
	IsString,
} from "class-validator";

const VALID_SORT_ORDERS = ["asc", "desc"] as const;

const VALID_SORT_FIELDS = ["createdAt", "productName", "quantity"] as const;

const VALID_MOVEMENT_TYPES = ["ENTRY", "EXIT", "ADJUSTMENT"] as const;

export class ListInventoryMovementsDto {
	@IsOptional()
	@IsIn([...VALID_MOVEMENT_TYPES])
	movementType?: string;

	@IsOptional()
	@IsString()
	startDate?: string;

	@IsOptional()
	@IsString()
	endDate?: string;

	@IsOptional()
	@IsString()
	productId?: string;

	@IsOptional()
	@IsString()
	supplierId?: string;

	@IsOptional()
	@IsString()
	createdBy?: string;

	@IsOptional()
	@IsBooleanString()
	includeInactiveProducts?: string;

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
