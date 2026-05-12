import { Type } from "class-transformer";
import {
	ArrayMinSize,
	IsArray,
	IsDateString,
	IsOptional,
	IsString,
	MaxLength,
	ValidateNested,
} from "class-validator";
import { CreatePurchaseOrderItemDto } from "./create-purchase-order-item.dto.js";

export class CreatePurchaseOrderDto {
	@IsString()
	supplierId!: string;

	@IsOptional()
	@IsDateString()
	estimatedReceiptDate?: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	paymentTerms?: string;

	@IsOptional()
	@IsString()
	@MaxLength(2000)
	notes?: string;

	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => CreatePurchaseOrderItemDto)
	items!: CreatePurchaseOrderItemDto[];
}
