import {
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
} from "class-validator";

export class CreateCustomerDto {
	@IsEnum(["NATURAL", "JURIDICA"], {
		message: "El tipo de persona debe ser NATURAL o JURIDICA",
	})
	personType!: "NATURAL" | "JURIDICA";

	@IsString()
	@IsNotEmpty()
	@MaxLength(150)
	fullName!: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(20)
	taxId!: string;

	@IsOptional()
	@IsString()
	@MaxLength(255)
	address?: string;

	@IsOptional()
	@IsString()
	@MaxLength(30)
	phone?: string;

	@IsOptional()
	@IsEmail()
	@MaxLength(255)
	email?: string;
}
