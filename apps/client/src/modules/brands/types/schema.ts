import { z } from "zod";

export const brandFormSchema = z.object({
	name: z
		.string()
		.min(1, "El nombre es obligatorio")
		.max(100, "Máximo 100 caracteres"),
	logoUrl: z.string().min(1, "El logo es obligatorio").max(2048),
});

export type BrandFormValues = z.infer<typeof brandFormSchema>;
