import { IsOptional, IsString } from "class-validator";

export class ListPurchaseOrdersDto {
	@IsOptional()
	@IsString()
	search?: string;

	@IsOptional()
	@IsString()
	status?: string;

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
