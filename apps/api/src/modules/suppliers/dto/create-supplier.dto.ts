import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
} from "class-validator";

export class CreateSupplierDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name!: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(30)
	taxId!: string;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	contactName?: string;

	@IsOptional()
	@IsString()
	@MaxLength(30)
	phone?: string;

	@IsOptional()
	@IsEmail()
	@MaxLength(255)
	email?: string;

	@IsOptional()
	@IsString()
	@MaxLength(255)
	address?: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	commercialConditions?: string;
}
