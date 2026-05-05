import { Type } from "class-transformer";
import {
	ArrayMinSize,
	IsIn,
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

	@IsIn(["existing", "new"])
	brandMode!: "existing" | "new";

	@ValidateIf((dto: CreateProductDto) => dto.brandMode === "existing")
	@IsUUID()
	brandId!: string;

	@ValidateIf((dto: CreateProductDto) => dto.brandMode === "new")
	@IsString()
	@IsNotEmpty()
	@MaxLength(120)
	newBrandName?: string;

	@ValidateNested({ each: true })
	@Type(() => ProductImageInputDto)
	@ArrayMinSize(1)
	images!: ProductImageInputDto[];
}
