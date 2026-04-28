import type { UserRole } from "@/lib/user-roles.js";

export type UserStatus = "ACTIVE" | "INACTIVE";

export interface User {
	id: string;
	fullName: string;
	email: string;
	status: UserStatus;
	role: { slug: UserRole; name: string };
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
	role?: UserRole;
	page?: number;
	limit?: number;
}

export interface CreateUserPayload {
	fullName: string;
	email: string;
	password: string;
	role: UserRole;
}

export interface UpdateUserPayload {
	fullName?: string;
	email?: string;
	role?: UserRole;
}
