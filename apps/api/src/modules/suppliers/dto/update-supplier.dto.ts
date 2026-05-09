import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	ValidateIf,
} from "class-validator";

export class UpdateSupplierDto {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name?: string;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(30)
	taxId?: string;

	@IsOptional()
	@ValidateIf((_, value: string | null | undefined) => value !== null)
	@IsString()
	@MaxLength(100)
	contactName?: string | null;

	@IsOptional()
	@ValidateIf((_, value: string | null | undefined) => value !== null)
	@IsString()
	@MaxLength(30)
	phone?: string | null;

	@IsOptional()
	@ValidateIf((_, value: string | null | undefined) => value !== null)
	@IsEmail()
	@MaxLength(255)
	email?: string | null;

	@IsOptional()
	@ValidateIf((_, value: string | null | undefined) => value !== null)
	@IsString()
	@MaxLength(255)
	address?: string | null;

	@IsOptional()
	@ValidateIf((_, value: string | null | undefined) => value !== null)
	@IsString()
	@MaxLength(500)
	commercialConditions?: string | null;
}
