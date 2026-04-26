import type { UserStatus } from "../../../../generated/prisma/client.js";

export interface UserFilters {
	search?: string;
	status?: UserStatus | "ALL";
	roleId?: string;
	page: number;
	limit: number;
}

export interface PaginatedResult<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
