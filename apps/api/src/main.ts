import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
	const port = Number(process.env.PORT) || 4000;
	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix("api");
	await app.listen(port);

	const url = `http://localhost:${port}/api`;
	Logger.log(`listening on ${url}`, "Bootstrap");
}
bootstrap();
