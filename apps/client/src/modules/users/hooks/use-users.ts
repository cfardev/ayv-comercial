import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch.js";
import type {
	CreateUserPayload,
	PaginatedResponse,
	Role,
	UpdateUserPayload,
	User,
	UserFilters,
} from "../types/api.js";

const API_BASE = "/api";

async function fetchUsers(
	filters: UserFilters,
): Promise<PaginatedResponse<User>> {
	const params = new URLSearchParams();
	if (filters.search) params.set("search", filters.search);
	if (filters.status && filters.status !== "ALL")
		params.set("status", filters.status);
	if (filters.roleId) params.set("roleId", filters.roleId);
	if (filters.page) params.set("page", String(filters.page));
	if (filters.limit) params.set("limit", String(filters.limit));

	const res = await authFetch(`${API_BASE}/users?${params.toString()}`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message ?? "Error al obtener usuarios");
	}
	return res.json();
}

async function fetchRoles(): Promise<Role[]> {
	const res = await authFetch(`${API_BASE}/roles`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message ?? "Error al obtener roles");
	}
	return res.json();
}

async function fetchUser(id: string): Promise<User> {
	const res = await authFetch(`${API_BASE}/users/${id}`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message ?? "Error al obtener usuario");
	}
	return res.json();
}

async function createUser(data: CreateUserPayload): Promise<User> {
	const res = await authFetch(`${API_BASE}/users`, {
		method: "POST",
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(error.message ?? "Error al crear usuario");
	}
	return res.json();
}

async function updateUser(id: string, data: UpdateUserPayload): Promise<User> {
	const res = await authFetch(`${API_BASE}/users/${id}`, {
		method: "PATCH",
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(error.message ?? "Error al actualizar usuario");
	}
	return res.json();
}

async function deactivateUser(id: string): Promise<User> {
	const res = await authFetch(`${API_BASE}/users/${id}/deactivate`, {
		method: "POST",
	});
	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(error.message ?? "Error al desactivar usuario");
	}
	return res.json();
}

async function reactivateUser(id: string): Promise<User> {
	const res = await authFetch(`${API_BASE}/users/${id}/reactivate`, {
		method: "POST",
	});
	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(error.message ?? "Error al reactivar usuario");
	}
	return res.json();
}

export function useUsers(filters: UserFilters) {
	return useQuery({
		queryKey: ["users", filters],
		queryFn: () => fetchUsers(filters),
	});
}

export function useRoles() {
	return useQuery({
		queryKey: ["roles"],
		queryFn: fetchRoles,
	});
}

export function useUser(id: string) {
	return useQuery({
		queryKey: ["users", id],
		queryFn: () => fetchUser(id),
		enabled: !!id,
	});
}

export function useCreateUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createUser,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}

export function useUpdateUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) =>
			updateUser(id, data),
		onSuccess: (_, variables) => {
			void queryClient.invalidateQueries({ queryKey: ["users"] });
			void queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
		},
	});
}

export function useDeactivateUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deactivateUser,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}

export function useReactivateUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: reactivateUser,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}

async function hardDeleteUser(id: string): Promise<void> {
	const res = await authFetch(`${API_BASE}/users/${id}`, {
		method: "DELETE",
	});
	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(error.message ?? "Error al eliminar usuario");
	}
}

async function checkCanHardDelete(id: string): Promise<{ canDelete: boolean }> {
	const res = await authFetch(`${API_BASE}/users/${id}/can-hard-delete`);
	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(error.message ?? "Error al verificar eliminación");
	}
	return res.json();
}

export function useHardDeleteUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: hardDeleteUser,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}

export function useCanHardDelete(id: string) {
	return useQuery({
		queryKey: ["users", id, "can-hard-delete"],
		queryFn: () => checkCanHardDelete(id),
		enabled: !!id,
	});
}
