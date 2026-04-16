import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MONOREPO_ROOT_ENV_FILE } from "./monorepo-env";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: MONOREPO_ROOT_ENV_FILE,
		}),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
