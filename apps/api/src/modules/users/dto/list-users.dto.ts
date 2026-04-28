import { IsEnum, IsOptional, IsString } from "class-validator";
import { UserRole } from "../../../../generated/prisma/client.js";

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
	@IsEnum(UserRole)
	role?: UserRole;

	@IsOptional()
	@IsString()
	page?: string;

	@IsOptional()
	@IsString()
	limit?: string;
}
