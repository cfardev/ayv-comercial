import { IsEnum, IsOptional, IsString } from "class-validator";

export enum UserStatusFilter {
	ACTIVE = "ACTIVE",
	INACTIVE = "INACTIVE",
	ALL = "ALL",
}

export class ListUsersDto {
	@IsOptional()
	@IsString()
	search?: string;

	@IsOptional()
	@IsEnum(UserStatusFilter)
	status?: UserStatusFilter;

	@IsOptional()
	@IsString()
	roleId?: string;

	@IsOptional()
	@IsString()
	page?: string;

	@IsOptional()
	@IsString()
	limit?: string;
}
