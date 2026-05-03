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
