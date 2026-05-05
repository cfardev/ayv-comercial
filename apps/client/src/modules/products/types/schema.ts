import { z } from "zod";

const productImageSchema = z.object({
	url: z.string().url("URL inválida"),
	fileKey: z.string().optional(),
	sortOrder: z.number().int().min(0).default(0),
});

export const productFormSchema = z
	.object({
		name: z
			.string()
			.min(1, "El nombre es obligatorio")
			.max(200, "Máximo 200 caracteres"),
		description: z.string().max(2000, "Máximo 2000 caracteres").optional(),
		cost: z.coerce.number().min(0.01, "El costo debe ser mayor a 0"),
		price: z.coerce.number().min(0.01, "El precio debe ser mayor a 0"),
		categoryId: z.string().min(1, "Elige una categoría"),
		images: z.array(productImageSchema).min(1, "Agrega al menos una imagen"),
	})
	.refine((data) => data.price > data.cost, {
		message: "El precio de venta debe ser mayor que el costo",
		path: ["price"],
	});

export type ProductFormValues = z.infer<typeof productFormSchema>;
