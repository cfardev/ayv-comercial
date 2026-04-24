import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "./auth.service.js";
import { Public } from "./decorators/public.decorator.js";
import { LoginRequestDto } from "./dto/login-request.dto.js";
import type { LoginResponseDto } from "./dto/login-response.dto.js";
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
			name: string;
			email: string;
			role: { name: string };
		};
		const ip =
			(req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ??
			req.socket.remoteAddress ??
			"unknown";
		return this.authService.login(user, ip);
	}
}
