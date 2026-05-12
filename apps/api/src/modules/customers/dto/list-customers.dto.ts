import { IsOptional, IsString } from "class-validator";

export class ListCustomersDto {
	@IsOptional()
	@IsString()
	search?: string;

	@IsOptional()
	@IsString()
	personType?: string;

	@IsOptional()
	@IsString()
	isActive?: string;

	@IsOptional()
	@IsString()
	page?: string;

	@IsOptional()
	@IsString()
	limit?: string;
}
