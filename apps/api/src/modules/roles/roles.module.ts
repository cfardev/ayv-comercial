import { Module } from "@nestjs/common";
import { PrismaModule } from "../../common/prisma/prisma.module.js";
import { RolesController } from "./roles.controller.js";

@Module({
	imports: [PrismaModule],
	controllers: [RolesController],
})
export class RolesModule {}
