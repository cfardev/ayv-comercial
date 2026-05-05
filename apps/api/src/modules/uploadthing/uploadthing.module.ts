import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "../../auth/auth.module.js";
import { UploadthingController } from "./uploadthing.controller.js";

@Module({
	imports: [ConfigModule, AuthModule],
	controllers: [UploadthingController],
})
export class UploadthingModule {}
