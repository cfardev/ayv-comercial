/** Must match API `system-roles.ts` (`SYSTEM_ADMIN_SLUG`). */
export const SYSTEM_ADMIN_ROLE_SLUG = "ADMIN";

/** Must match API `permission-keys.ts`. */
export const PERMISSION_KEYS = {
	USERS_READ: "users:read",
	USERS_CREATE: "users:create",
	USERS_UPDATE: "users:update",
	USERS_DEACTIVATE: "users:deactivate",
	USERS_REACTIVATE: "users:reactivate",
	USERS_DELETE: "users:delete",
	CATEGORIES_READ: "categories:read",
	CATEGORIES_CREATE: "categories:create",
	CATEGORIES_UPDATE: "categories:update",
	CATEGORIES_DEACTIVATE: "categories:deactivate",
	CATEGORIES_REACTIVATE: "categories:reactivate",
	BRANDS_READ: "brands:read",
	BRANDS_CREATE: "brands:create",
	BRANDS_UPDATE: "brands:update",
	BRANDS_DEACTIVATE: "brands:deactivate",
	BRANDS_REACTIVATE: "brands:reactivate",
	SUPPLIERS_READ: "suppliers:read",
	SUPPLIERS_CREATE: "suppliers:create",
	SUPPLIERS_UPDATE: "suppliers:update",
	SUPPLIERS_DEACTIVATE: "suppliers:deactivate",
	SUPPLIERS_REACTIVATE: "suppliers:reactivate",
	PRODUCTS_READ: "products:read",
	PRODUCTS_CREATE: "products:create",
	PRODUCTS_UPDATE: "products:update",
	PRODUCTS_DEACTIVATE: "products:deactivate",
	PRODUCTS_REACTIVATE: "products:reactivate",
	PRODUCTS_UPLOAD: "products:upload",
	CUSTOMERS_READ: "customers:read",
	CUSTOMERS_CREATE: "customers:create",
	CUSTOMERS_UPDATE: "customers:update",
	CUSTOMERS_DEACTIVATE: "customers:deactivate",
	CUSTOMERS_REACTIVATE: "customers:reactivate",
	PURCHASE_ORDERS_READ: "purchase-orders:read",
	PURCHASE_ORDERS_CREATE: "purchase-orders:create",
	PURCHASE_ORDERS_UPDATE: "purchase-orders:update",
	INVENTORY_ENTRIES_READ: "inventory-entries:read",
	INVENTORY_ENTRIES_CREATE: "inventory-entries:create",
	INVENTORY_STOCK_READ: "inventory-stock:read",
	INVENTORY_MOVEMENTS_READ: "inventory-movements:read",
} as const;

export type PermissionKey =
	(typeof PERMISSION_KEYS)[keyof typeof PERMISSION_KEYS];

export function hasPermission(
	permissions: string[] | undefined,
	key: string,
): boolean {
	return permissions?.includes(key) ?? false;
}

/** System administrator always has full UI access (matches API; avoids stale sessions without `permissions`). */
export function isSystemAdminRole(roleSlug: string | undefined): boolean {
	return roleSlug === SYSTEM_ADMIN_ROLE_SLUG;
}

export function hasPermissionOrSystemAdmin(
	permissions: string[] | undefined,
	key: string,
	roleSlug: string | undefined,
): boolean {
	return isSystemAdminRole(roleSlug) || hasPermission(permissions, key);
}
