import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class CreateUserDto {
	@IsString()
	@IsNotEmpty()
	fullName!: string;

	@IsString()
	@IsNotEmpty()
	email!: string;

	@IsString()
	@MinLength(8)
	@Matches(/[A-Z]/, {
		message: "La contraseña debe contener al menos una mayúscula",
	})
	@Matches(/[0-9]/, {
		message: "La contraseña debe contener al menos un número",
	})
	password!: string;

	@IsString()
	@IsNotEmpty()
	roleId!: string;
}
