import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Logger, LoggerErrorInterceptor } from "nestjs-pino";
import { AppModule } from "./app.module.js";

async function bootstrap() {
	const port = Number(process.env.PORT) || 4000;
	const app = await NestFactory.create(AppModule, { bufferLogs: true });
	app.useLogger(app.get(Logger));
	app.useGlobalInterceptors(new LoggerErrorInterceptor());
	app.enableShutdownHooks();
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);
	app.setGlobalPrefix("api");
	await app.listen(port);

	app.get(Logger).log(`Server on port ${port}`, "Bootstrap");
}
bootstrap();
