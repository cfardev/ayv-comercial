export class LoginResponseUserDto {
	id!: string;
	fullName!: string;
	email!: string;
	role!: {
		name: string;
		slug: string;
	};
	permissions!: string[];
}

export class LoginResponseDto {
	accessToken!: string;
	expiresIn!: number;
	user!: LoginResponseUserDto;
}
