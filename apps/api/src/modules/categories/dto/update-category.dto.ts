import {
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	ValidateIf,
} from "class-validator";

export class UpdateCategoryDto {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name?: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	description?: string;

	/** null = remove parent (make root). undefined = not provided (keep existing). */
	@IsOptional()
	@ValidateIf((o: UpdateCategoryDto) => o.parentId !== null)
	@IsString()
	parentId?: string | null;
}
