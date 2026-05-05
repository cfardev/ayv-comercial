import { z } from "zod";

export const brandFormSchema = z.object({
	name: z
		.string()
		.min(1, "El nombre es obligatorio")
		.max(100, "Máximo 100 caracteres"),
	logoUrl: z.string().max(2048).nullish(),
});

export type BrandFormValues = z.infer<typeof brandFormSchema>;
