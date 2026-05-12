import { IsNotEmpty, IsString } from "class-validator";

export class ProductsBySupplierDto {
	@IsString()
	@IsNotEmpty()
	supplierId!: string;
}
