import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class CreatePurchaseOrderItemDto {
	@IsString()
	@IsNotEmpty()
	productId!: string;

	@Type(() => Number)
	@IsNumber()
	@Min(1)
	quantityOrdered!: number;

	@Type(() => Number)
	@IsNumber()
	@Min(0.01)
	unitCost!: number;
}
