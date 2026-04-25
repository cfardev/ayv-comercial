import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";
import { Strategy } from "passport-local";
// biome-ignore lint/style/useImportType: required as runtime DI token metadata.
import { AuthService } from "../auth.service.js";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly authService: AuthService) {
		super({
			usernameField: "email",
			passwordField: "password",
			passReqToCallback: true,
		});
	}

	async validate(req: Request, email: string, password: string) {
		const ip =
			(req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ??
			req.socket.remoteAddress ??
			"unknown";
		const user = await this.authService.validateUser(email, password, ip);
		return user;
	}
}
