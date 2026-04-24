import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { AuthModule } from "./auth/auth.module.js";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard.js";
import { CatchEverythingFilter } from "./common/filters/catch-everything.filter.js";
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
