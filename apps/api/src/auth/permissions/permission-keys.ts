/** Stable permission keys (English) — align with seed and guards. */
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
} as const;

export type PermissionKey =
	(typeof PERMISSION_KEYS)[keyof typeof PERMISSION_KEYS];

export const ALL_PERMISSION_VALUES: PermissionKey[] =
	Object.values(PERMISSION_KEYS);
