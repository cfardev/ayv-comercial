import { z } from "zod";

export const categoryFormSchema = z.object({
	name: z
		.string()
		.min(1, "El nombre es obligatorio")
		.max(100, "Máximo 100 caracteres"),
	description: z.string().max(500, "Máximo 500 caracteres").optional(),
	parentId: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
