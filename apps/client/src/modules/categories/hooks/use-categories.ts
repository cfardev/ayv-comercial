import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch.js";
import type {
	Category,
	CategoryFilters,
	CreateCategoryPayload,
	PaginatedResponse,
	UpdateCategoryPayload,
} from "../types/api.js";

const API_BASE = "/api";

async function fetchCategories(
	filters: CategoryFilters,
): Promise<PaginatedResponse<Category>> {
	const params = new URLSearchParams();
	if (filters.search) params.set("search", filters.search);
	if (filters.parentId !== undefined) params.set("parentId", filters.parentId);
	if (filters.status && filters.status !== "ALL")
		params.set("status", filters.status);
	if (filters.page) params.set("page", String(filters.page));
	if (filters.limit) params.set("limit", String(filters.limit));

	const res = await authFetch(`${API_BASE}/categories?${params.toString()}`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(
			(data as { message?: string }).message ?? "Error al obtener categorías",
		);
	}
	return res.json() as Promise<PaginatedResponse<Category>>;
}

async function fetchCategory(id: string): Promise<Category> {
	const res = await authFetch(`${API_BASE}/categories/${id}`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(
			(data as { message?: string }).message ?? "Error al obtener categoría",
		);
	}
	return res.json() as Promise<Category>;
}

async function createCategory(data: CreateCategoryPayload): Promise<Category> {
	const res = await authFetch(`${API_BASE}/categories`, {
		method: "POST",
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ?? "Error al crear categoría",
		);
	}
	return res.json() as Promise<Category>;
}

async function updateCategory(
	id: string,
	data: UpdateCategoryPayload,
): Promise<Category> {
	const res = await authFetch(`${API_BASE}/categories/${id}`, {
		method: "PATCH",
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ??
				"Error al actualizar categoría",
		);
	}
	return res.json() as Promise<Category>;
}

async function deactivateCategory(id: string): Promise<Category> {
	const res = await authFetch(`${API_BASE}/categories/${id}/deactivate`, {
		method: "POST",
	});
	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ??
				"Error al desactivar categoría",
		);
	}
	return res.json() as Promise<Category>;
}

async function reactivateCategory(id: string): Promise<Category> {
	const res = await authFetch(`${API_BASE}/categories/${id}/reactivate`, {
		method: "POST",
	});
	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ?? "Error al reactivar categoría",
		);
	}
	return res.json() as Promise<Category>;
}

export function useCategories(filters: CategoryFilters) {
	return useQuery({
		queryKey: ["categories", filters],
		queryFn: () => fetchCategories(filters),
	});
}

export function useCategory(id: string) {
	return useQuery({
		queryKey: ["categories", id],
		queryFn: () => fetchCategory(id),
		enabled: !!id,
	});
}

export function useCreateCategory() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createCategory,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["categories"] });
		},
	});
}

export function useUpdateCategory() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateCategoryPayload }) =>
			updateCategory(id, data),
		onSuccess: (_, variables) => {
			void queryClient.invalidateQueries({ queryKey: ["categories"] });
			void queryClient.invalidateQueries({
				queryKey: ["categories", variables.id],
			});
		},
	});
}

export function useDeactivateCategory() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deactivateCategory,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["categories"] });
		},
	});
}

export function useReactivateCategory() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: reactivateCategory,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["categories"] });
		},
	});
}
