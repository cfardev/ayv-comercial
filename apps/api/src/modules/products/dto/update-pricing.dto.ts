import {
	IsBoolean,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	MaxLength,
} from "class-validator";

export class UpdatePricingDto {
	@IsNumber()
	@IsPositive()
	cost!: number;

	@IsNumber()
	@IsPositive()
	salePrice!: number;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	justification?: string;

	/**
	 * Required when salePrice <= cost (negative margin warning override).
	 */
	@IsOptional()
	@IsBoolean()
	forceNegativeMargin?: boolean;

	/**
	 * Required when price variation > 50% from previous price (large variation warning override).
	 */
	@IsOptional()
	@IsBoolean()
	forceLargeVariation?: boolean;
}
