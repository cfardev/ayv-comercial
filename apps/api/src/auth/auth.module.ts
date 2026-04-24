import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { JwtAuthGuard } from "./guards/jwt-auth.guard.js";
import { LocalAuthGuard } from "./guards/local-auth.guard.js";
import { JwtStrategy } from "./strategies/jwt.strategy.js";
import { LocalStrategy } from "./strategies/local.strategy.js";

@Module({
	imports: [
		PassportModule.register({ defaultStrategy: "jwt" }),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>("JWT_SECRET", "dev-secret"),
				signOptions: {
					expiresIn: configService.get<string>("JWT_EXPIRATION", "1d") as never,
				},
			}),
		}),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		LocalStrategy,
		JwtStrategy,
		JwtAuthGuard,
		LocalAuthGuard,
	],
	exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
