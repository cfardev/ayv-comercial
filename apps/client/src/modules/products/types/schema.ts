import { z } from "zod";

const productImageSchema = z.object({
	url: z.string().url("URL inválida"),
	fileKey: z.string().optional(),
	sortOrder: z.number().int().min(0).default(0),
});

export const productFormSchema = z
	.object({
		code: z
			.string()
			.min(1, "El código es obligatorio")
			.max(50, "Máximo 50 caracteres"),
		name: z
			.string()
			.min(1, "El nombre es obligatorio")
			.max(200, "Máximo 200 caracteres"),
		description: z.string().max(2000, "Máximo 2000 caracteres").optional(),
		cost: z.coerce.number().min(0.01, "El costo debe ser mayor a 0"),
		price: z.coerce.number().min(0.01, "El precio debe ser mayor a 0"),
		categoryId: z.string().min(1, "Elige una categoría"),
		brandMode: z.enum(["existing", "new"]),
		brandId: z.string(),
		newBrandName: z.string(),
		images: z.array(productImageSchema).min(1, "Agrega al menos una imagen"),
		unitOfMeasure: z.string().max(20, "Máximo 20 caracteres").optional(),
		minimumStock: z.coerce
			.number()
			.int()
			.min(0, "No puede ser negativo")
			.default(0),
		supplier: z.string().max(200, "Máximo 200 caracteres").optional(),
	})
	.superRefine((data, ctx) => {
		if (data.brandMode === "existing") {
			if (!data.brandId.trim()) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["brandId"],
					message: "Selecciona una marca existente",
				});
			}
		} else {
			const trimmed = data.newBrandName.trim();
			if (!trimmed) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["newBrandName"],
					message: "Escribe el nombre de la nueva marca",
				});
			} else if (trimmed.length > 120) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["newBrandName"],
					message: "Máximo 120 caracteres",
				});
			}
		}
	})
	.refine((data) => data.price > data.cost, {
		message: "El precio de venta debe ser mayor que el costo",
		path: ["price"],
	});

export type ProductFormValues = z.infer<typeof productFormSchema>;
