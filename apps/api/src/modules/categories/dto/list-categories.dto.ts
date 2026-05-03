import { IsOptional, IsString } from "class-validator";

export class ListCategoriesDto {
	@IsOptional()
	@IsString()
	search?: string;

	@IsOptional()
	@IsString()
	parentId?: string;

	@IsOptional()
	@IsString()
	status?: string;

	@IsOptional()
	@IsString()
	page?: string;

	@IsOptional()
	@IsString()
	limit?: string;
}
