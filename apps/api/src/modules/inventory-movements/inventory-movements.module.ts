import { Module } from "@nestjs/common";
import { AuthModule } from "../../auth/auth.module.js";
import { PrismaModule } from "../../common/prisma/prisma.module.js";
import { InventoryMovementsController } from "./inventory-movements.controller.js";
import { InventoryMovementsService } from "./inventory-movements.service.js";

@Module({
	imports: [PrismaModule, AuthModule],
	controllers: [InventoryMovementsController],
	providers: [InventoryMovementsService],
	exports: [InventoryMovementsService],
})
export class InventoryMovementsModule {}
