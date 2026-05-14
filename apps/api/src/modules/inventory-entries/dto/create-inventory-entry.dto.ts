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
import { CreateInventoryEntryItemDto } from "./create-inventory-entry-item.dto.js";

export class CreateInventoryEntryDto {
	@IsString()
	purchaseOrderId!: string;

	@IsOptional()
	@IsDateString()
	entryDate?: string;

	@IsOptional()
	@IsString()
	@MaxLength(2000)
	notes?: string;

	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => CreateInventoryEntryItemDto)
	items!: CreateInventoryEntryItemDto[];
}
