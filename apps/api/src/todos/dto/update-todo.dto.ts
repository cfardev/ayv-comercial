import {
	IsBoolean,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from "class-validator";

export class UpdateTodoDto {
	@IsOptional()
	@IsString()
	@MinLength(1)
	@MaxLength(500)
	title?: string;

	@IsOptional()
	@IsBoolean()
	done?: boolean;
}
