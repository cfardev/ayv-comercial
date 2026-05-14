import { IsOptional, IsString } from "class-validator";

export class ListInventoryEntriesDto {
	@IsOptional()
	@IsString()
	search?: string;

	@IsOptional()
	@IsString()
	fromDate?: string;

	@IsOptional()
	@IsString()
	toDate?: string;

	@IsOptional()
	@IsString()
	page?: string;

	@IsOptional()
	@IsString()
	limit?: string;
}
