import { Module } from "@nestjs/common";
import { AuthModule } from "../../auth/auth.module.js";
import { PrismaModule } from "../../common/prisma/prisma.module.js";
import { InventoryEntriesController } from "./inventory-entries.controller.js";
import { InventoryEntriesService } from "./inventory-entries.service.js";

@Module({
	imports: [PrismaModule, AuthModule],
	controllers: [InventoryEntriesController],
	providers: [InventoryEntriesService],
	exports: [InventoryEntriesService],
})
export class InventoryEntriesModule {}
