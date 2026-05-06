import { Type } from "class-transformer";
import {
	IsInt,
	IsOptional,
	IsString,
	IsUrl,
	MaxLength,
	Min,
} from "class-validator";

export class ProductImageInputDto {
	@IsString()
	@IsUrl({ require_tld: false })
	@MaxLength(2048)
	url!: string;

	@IsOptional()
	@IsString()
	@MaxLength(512)
	fileKey?: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	sortOrder?: number;
}
