import { Injectable } from "@nestjs/common";
// biome-ignore lint/style/useImportType: required as runtime DI token metadata.
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

export interface JwtPayload {
	sub: string;
	email: string;
	roleName: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>("JWT_SECRET", "dev-secret"),
		});
	}

	async validate(payload: JwtPayload) {
		return {
			userId: payload.sub,
			email: payload.email,
			roleName: payload.roleName,
		};
	}
}
