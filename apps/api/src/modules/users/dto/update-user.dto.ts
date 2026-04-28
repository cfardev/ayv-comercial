import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { UserRole } from "../../../../generated/prisma/client.js";

export class UpdateUserDto {
	@IsOptional()
	@IsString()
	fullName?: string;

	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsEnum(UserRole)
	role?: UserRole;
}
