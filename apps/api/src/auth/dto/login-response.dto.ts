import type { RoleName } from "../../../generated/prisma/client.js";

export class LoginResponseUserDto {
	id: string;
	fullName: string;
	email: string;
	role: {
		name: RoleName;
	};
}

export class LoginResponseDto {
	accessToken: string;
	expiresIn: number;
	user: LoginResponseUserDto;
}
