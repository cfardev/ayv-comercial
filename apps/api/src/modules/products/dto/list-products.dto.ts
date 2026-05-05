import { IsOptional, IsString } from "class-validator";

export class ListProductsDto {
	@IsOptional()
	@IsString()
	search?: string;

	@IsOptional()
	@IsString()
	status?: string;

	@IsOptional()
	@IsString()
	categoryId?: string;

	@IsOptional()
	@IsString()
	minPrice?: string;

	@IsOptional()
	@IsString()
	maxPrice?: string;

	@IsOptional()
	@IsString()
	page?: string;

	@IsOptional()
	@IsString()
	limit?: string;
}
