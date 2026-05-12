import {
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
} from "class-validator";
import { PersonType } from "../../../../generated/prisma/client.js";

export class CreateCustomerDto {
	@IsEnum(PersonType, {
		message: "El tipo de persona debe ser NATURAL o JURIDICA",
	})
	personType!: PersonType;

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
