import { Type } from "class-transformer";
import {
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	MaxLength,
	Min,
	ValidateNested,
} from "class-validator";
import { ProductImageInputDto } from "./product-image-input.dto.js";

export class UpdateProductDto {
	@IsOptional()
	@IsString()
	@MaxLength(200)
	name?: string;

	@IsOptional()
	@IsString()
	@MaxLength(2000)
	description?: string;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0.01)
	cost?: number;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0.01)
	price?: number;

	@IsOptional()
	@IsUUID()
	categoryId?: string;

	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => ProductImageInputDto)
	images?: ProductImageInputDto[];
}
