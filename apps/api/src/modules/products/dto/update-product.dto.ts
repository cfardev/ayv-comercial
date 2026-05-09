import { Type } from "class-transformer";
import {
	IsIn,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	MaxLength,
	Min,
	ValidateIf,
	ValidateNested,
} from "class-validator";
import { ProductImageInputDto } from "./product-image-input.dto.js";

export class UpdateProductDto {
	@IsOptional()
	@IsString()
	@MaxLength(50)
	code?: string;

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

	@IsOptional()
	@IsIn(["existing", "new"])
	brandMode?: "existing" | "new";

	@ValidateIf((dto: UpdateProductDto) => dto.brandMode === "existing")
	@IsUUID()
	brandId?: string;

	@ValidateIf((dto: UpdateProductDto) => dto.brandMode === "new")
	@IsString()
	@IsNotEmpty()
	@MaxLength(120)
	newBrandName?: string;

	@IsOptional()
	@IsString()
	@MaxLength(20)
	unitOfMeasure?: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	minimumStock?: number;

	@IsOptional()
	@IsString()
	@MaxLength(200)
	supplier?: string;
}
