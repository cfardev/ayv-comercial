import { z } from "zod";

export const customerFormSchema = z
	.object({
		personType: z.enum(["NATURAL", "JURIDICA"]),
		fullName: z
			.string()
			.min(1, "El nombre es obligatorio")
			.max(150, "Máximo 150 caracteres"),
		taxId: z.string().min(1, "La identificación es obligatoria"),
		email: z
			.string()
			.max(255, "Máximo 255 caracteres")
			.email("Correo inválido")
			.optional()
			.refine((v) => v === undefined || v !== "", {
				message: "Correo inválido",
			}),
		phone: z.string().max(30, "Máximo 30 caracteres").optional(),
		address: z.string().max(255, "Máximo 255 caracteres").optional(),
	})
	.superRefine((data, ctx) => {
		if (data.personType === "NATURAL" && !/^\d{10}$/.test(data.taxId)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "La cédula debe tener exactamente 10 dígitos",
				path: ["taxId"],
			});
		}
		if (data.personType === "JURIDICA" && !/^\d{13}$/.test(data.taxId)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "El RUC debe tener exactamente 13 dígitos",
				path: ["taxId"],
			});
		}
	});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
