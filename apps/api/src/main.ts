import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

async function bootstrap() {
	const port = Number(process.env.PORT) || 4000;
	const app = await NestFactory.create(AppModule);
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

	Logger.log(`Server on port ${port}`, "Bootstrap");
}
bootstrap();
