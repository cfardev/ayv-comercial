import { z } from "zod";
import { USER_ROLE_VALUES } from "@/lib/user-roles.js";

const userRoleSchema = z.enum(USER_ROLE_VALUES);

export const createUserSchema = z.object({
	fullName: z.string().min(1, "El nombre es requerido"),
	email: z.string().email("Correo electrónico inválido"),
	password: z
		.string()
		.min(8, "La contraseña debe tener al menos 8 caracteres")
		.regex(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
		.regex(/[0-9]/, "La contraseña debe contener al menos un número"),
	role: userRoleSchema,
});

export const updateUserSchema = z.object({
	fullName: z.string().min(1, "El nombre es requerido").optional(),
	email: z.string().email("Correo electrónico inválido").optional(),
	role: userRoleSchema.optional(),
});

export type CreateUserForm = z.infer<typeof createUserSchema>;
export type UpdateUserForm = z.infer<typeof updateUserSchema>;
