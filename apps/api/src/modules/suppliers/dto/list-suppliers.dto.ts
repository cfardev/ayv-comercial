import { IsOptional, IsString } from "class-validator";

export class ListSuppliersDto {
	@IsOptional()
	@IsString()
	search?: string;

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
