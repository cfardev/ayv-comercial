/** Must match Prisma enum `UserRole` in `apps/api/prisma/schema.prisma`. */
export const USER_ROLE_VALUES = [
	"ADMIN",
	"SELLER",
	"INVENTORY_MANAGER",
	"DISPATCH_MANAGER",
	"OWNER_MANAGER",
] as const;

export type UserRole = (typeof USER_ROLE_VALUES)[number];

export const USER_ROLE_OPTIONS: { value: UserRole; label: string }[] = [
	{ value: "ADMIN", label: "Administrador" },
	{ value: "SELLER", label: "Vendedor" },
	{ value: "INVENTORY_MANAGER", label: "Encargado de inventario" },
	{ value: "DISPATCH_MANAGER", label: "Encargado de despacho" },
	{ value: "OWNER_MANAGER", label: "Propietario o gerente" },
];
