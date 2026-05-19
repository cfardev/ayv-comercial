import { Module } from "@nestjs/common";
import { AuthModule } from "../../auth/auth.module.js";
import { InventoryStockController } from "./inventory-stock.controller.js";
import { InventoryStockService } from "./inventory-stock.service.js";

@Module({
	imports: [AuthModule],
	controllers: [InventoryStockController],
	providers: [InventoryStockService],
	exports: [InventoryStockService],
})
export class InventoryStockModule {}
