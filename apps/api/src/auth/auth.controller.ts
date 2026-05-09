import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	NotFoundException,
	Post,
	Req,
	UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import type { UserRole } from "../../generated/prisma/client.js";
import { USER_ROLE_LABELS } from "../common/constants/user-role-labels.js";
import { AuthService } from "./auth.service.js";
import { Public } from "./decorators/public.decorator.js";
import { LoginRequestDto } from "./dto/login-request.dto.js";
import type {
	LoginResponseDto,
	LoginResponseUserDto,
} from "./dto/login-response.dto.js";
import { LocalAuthGuard } from "./guards/local-auth.guard.js";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@UseGuards(LocalAuthGuard)
	@Post("login")
	@HttpCode(HttpStatus.OK)
	async login(
		@Body() _dto: LoginRequestDto,
		@Req() req: Request,
	): Promise<LoginResponseDto> {
		const user = req.user as {
			id: string;
			fullName: string;
			email: string;
			role: UserRole;
		};
		const ip =
			(req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ??
			req.socket.remoteAddress ??
			"unknown";
		return this.authService.login(user, ip);
	}

	@Get("me")
	async me(@Req() req: Request): Promise<LoginResponseUserDto> {
		const { userId } = req.user as { userId: string };
		const user = await this.authService.getMe(userId);
		if (!user) throw new NotFoundException("Usuario no encontrado");
		return user;
	}

	@Get("roles")
	getRoles(): { slug: string; name: string }[] {
		return Object.entries(USER_ROLE_LABELS).map(([slug, name]) => ({
			slug,
			name,
		}));
	}
}
