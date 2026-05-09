import { z } from "zod";

export const supplierFormSchema = z.object({
	name: z
		.string()
		.min(1, "El nombre es obligatorio")
		.max(100, "Máximo 100 caracteres"),
	taxId: z
		.string()
		.min(1, "El documento fiscal es obligatorio")
		.max(30, "Máximo 30 caracteres"),
	contactName: z.string().max(100, "Máximo 100 caracteres").optional(),
	phone: z.string().max(30, "Máximo 30 caracteres").optional(),
	email: z
		.string()
		.max(255, "Máximo 255 caracteres")
		.email("Correo inválido")
		.or(z.literal("")),
	address: z.string().max(255, "Máximo 255 caracteres").optional(),
	commercialConditions: z.string().max(500, "Máximo 500 caracteres").optional(),
});

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;
