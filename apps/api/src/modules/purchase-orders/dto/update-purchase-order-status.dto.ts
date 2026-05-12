import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { PurchaseOrderStatus } from "../../../../generated/prisma/client.js";

export class UpdatePurchaseOrderStatusDto {
	@IsEnum(PurchaseOrderStatus)
	status!: PurchaseOrderStatus;

	@IsOptional()
	@IsString()
	@MaxLength(1000)
	notes?: string;
}
