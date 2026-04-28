import { UserRole } from "../../../generated/prisma/client.js";

/** Display names (Spanish) for API responses and audit context. */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
	[UserRole.ADMIN]: "Administrador",
	[UserRole.SELLER]: "Vendedor",
	[UserRole.INVENTORY_MANAGER]: "Encargado de inventario",
	[UserRole.DISPATCH_MANAGER]: "Encargado de despacho",
	[UserRole.OWNER_MANAGER]: "Propietario o gerente",
};

export function userRoleToResponse(role: UserRole): {
	slug: UserRole;
	name: string;
} {
	return { slug: role, name: USER_ROLE_LABELS[role] };
}
