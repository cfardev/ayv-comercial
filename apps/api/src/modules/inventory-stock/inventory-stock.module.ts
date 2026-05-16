import { Module } from "@nestjs/common";
import { InventoryStockController } from "./inventory-stock.controller.js";
import { InventoryStockService } from "./inventory-stock.service.js";

@Module({
	controllers: [InventoryStockController],
	providers: [InventoryStockService],
	exports: [InventoryStockService],
})
export class InventoryStockModule {}
