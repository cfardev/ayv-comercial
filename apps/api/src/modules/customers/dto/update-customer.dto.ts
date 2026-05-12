import {
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	ValidateIf,
} from "class-validator";

export class UpdateCustomerDto {
	@IsOptional()
	@IsEnum(["NATURAL", "JURIDICA"], {
		message: "El tipo de persona debe ser NATURAL o JURIDICA",
	})
	personType?: "NATURAL" | "JURIDICA";

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(150)
	fullName?: string;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(20)
	taxId?: string;

	@IsOptional()
	@ValidateIf((_, value: string | null | undefined) => value !== null)
	@IsString()
	@MaxLength(255)
	address?: string | null;

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
}
