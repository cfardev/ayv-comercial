import { Type } from "class-transformer";
import {
	IsDateString,
	IsInt,
	IsOptional,
	IsString,
	Min,
} from "class-validator";

export class CreateInventoryEntryItemDto {
	@IsString()
	productId!: string;

	@Type(() => Number)
	@IsInt()
	@Min(1)
	quantityReceived!: number;

	@IsOptional()
	@IsString()
	lotNumber?: string;

	@IsOptional()
	@IsDateString()
	expirationDate?: string;
}
