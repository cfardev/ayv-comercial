import { z } from "zod";

export const createUserSchema = z.object({
	fullName: z.string().min(1, "El nombre es requerido"),
	email: z.string().email("Correo electrónico inválido"),
	password: z
		.string()
		.min(8, "La contraseña debe tener al menos 8 caracteres")
		.regex(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
		.regex(/[0-9]/, "La contraseña debe contener al menos un número"),
	roleId: z.string().min(1, "El rol es requerido"),
});

export const updateUserSchema = z.object({
	fullName: z.string().min(1, "El nombre es requerido").optional(),
	email: z.string().email("Correo electrónico inválido").optional(),
	roleId: z.string().min(1, "El rol es requerido").optional(),
});

export type CreateUserForm = z.infer<typeof createUserSchema>;
export type UpdateUserForm = z.infer<typeof updateUserSchema>;
