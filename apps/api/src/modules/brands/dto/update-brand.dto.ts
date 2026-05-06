import {
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	ValidateIf,
} from "class-validator";

export class UpdateBrandDto {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name?: string;

	@IsOptional()
	@ValidateIf((_, v: string | null | undefined) => v !== null)
	@IsString()
	@MaxLength(2048)
	logoUrl?: string | null;
}
