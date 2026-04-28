import { UserRole } from "../../../generated/prisma/client.js";
import {
	ALL_PERMISSION_VALUES,
	PERMISSION_KEYS,
	type PermissionKey,
} from "./permission-keys.js";

/** Static permissions per role (replaces DB role_permissions). */
export const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
	[UserRole.ADMIN]: [...ALL_PERMISSION_VALUES],
	[UserRole.SELLER]: [],
	[UserRole.INVENTORY_MANAGER]: [],
	[UserRole.DISPATCH_MANAGER]: [],
	[UserRole.OWNER_MANAGER]: [PERMISSION_KEYS.USERS_READ],
};

export function getPermissionsForRole(role: UserRole): PermissionKey[] {
	return ROLE_PERMISSIONS[role] ?? [];
}
