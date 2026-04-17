import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateTodoDto {
	@IsString()
	@MinLength(1)
	@MaxLength(500)
	title!: string;
}
