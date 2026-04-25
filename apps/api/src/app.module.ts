import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { AuthModule } from "./auth/auth.module.js";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard.js";
import { CatchEverythingFilter } from "./common/filters/catch-everything.filter.js";
import { createPinoHttpOptions } from "./common/logging/pino-http.config.js";
import { PrismaModule } from "./common/prisma/prisma.module.js";
import {
	CLIENT_DIST_PATH,
	MONOREPO_ROOT_ENV_FILE,
} from "./common/utils/monorepo-paths.js";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: MONOREPO_ROOT_ENV_FILE,
		}),
		LoggerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				pinoHttp: createPinoHttpOptions(configService),
			}),
		}),
		ThrottlerModule.forRoot([
			{
				ttl: 60000,
				limit: 10,
			},
		]),
		PrismaModule,
		AuthModule,
		ServeStaticModule.forRoot({
			rootPath: CLIENT_DIST_PATH,
			exclude: ["/api", "/api/*path"],
		}),
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_FILTER,
			useClass: CatchEverythingFilter,
		},
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
	],
})
export class AppModule {}
