export type RoleName =
	| "ADMIN"
	| "SELLER"
	| "INVENTORY_MANAGER"
	| "DISPATCH_MANAGER"
	| "OWNER_MANAGER";

export type UserStatus = "ACTIVE" | "INACTIVE";

export interface Role {
	id: string;
	name: RoleName;
	createdAt: string;
}

export interface User {
	id: string;
	name: string;
	email: string;
	status: UserStatus;
	role: Role;
	failedAttempts: number;
	lockoutUntil: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface UserFilters {
	search?: string;
	status?: UserStatus | "ALL";
	roleId?: string;
	page?: number;
	limit?: number;
}

export interface CreateUserPayload {
	name: string;
	email: string;
	password: string;
	roleId: string;
}

export interface UpdateUserPayload {
	name?: string;
	email?: string;
	roleId?: string;
}
