import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { PrismaModule } from "./common/prisma/prisma.module.js";
import {
	CLIENT_DIST_PATH,
	MONOREPO_ROOT_ENV_FILE,
} from "./common/utils/monorepo-paths.js";

@Module({
	imports: [
		PrismaModule,
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: MONOREPO_ROOT_ENV_FILE,
		}),
		ServeStaticModule.forRoot({
			rootPath: CLIENT_DIST_PATH,
			exclude: ["/api", "/api/*path"],
		}),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
