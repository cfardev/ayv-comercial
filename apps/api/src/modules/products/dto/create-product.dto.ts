import { Type } from "class-transformer";
import {
	ArrayMinSize,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	MaxLength,
	Min,
	ValidateNested,
} from "class-validator";
import { ProductImageInputDto } from "./product-image-input.dto.js";

export class CreateProductDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(200)
	name!: string;

	@IsOptional()
	@IsString()
	@MaxLength(2000)
	description?: string;

	@Type(() => Number)
	@IsNumber()
	@Min(0.01)
	cost!: number;

	@Type(() => Number)
	@IsNumber()
	@Min(0.01)
	price!: number;

	@IsUUID()
	categoryId!: string;

	@ValidateNested({ each: true })
	@Type(() => ProductImageInputDto)
	@ArrayMinSize(1)
	images!: ProductImageInputDto[];
}
