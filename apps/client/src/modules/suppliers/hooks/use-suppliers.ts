import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch.js";
import type {
	CreateSupplierPayload,
	PaginatedResponse,
	Supplier,
	SupplierFilters,
	UpdateSupplierPayload,
} from "../types/api.js";

const API_BASE = "/api";
export const suppliersQueryKeyRoot = ["suppliers"] as const;

async function fetchSuppliers(
	filters: SupplierFilters,
): Promise<PaginatedResponse<Supplier>> {
	const params = new URLSearchParams();
	if (filters.search) params.set("search", filters.search);
	if (filters.status !== undefined) params.set("status", filters.status);
	if (filters.page) params.set("page", String(filters.page));
	if (filters.limit) params.set("limit", String(filters.limit));

	const response = await authFetch(
		`${API_BASE}/suppliers?${params.toString()}`,
	);
	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ?? "Error al obtener proveedores",
		);
	}

	return response.json() as Promise<PaginatedResponse<Supplier>>;
}

async function createSupplier(data: CreateSupplierPayload): Promise<Supplier> {
	const response = await authFetch(`${API_BASE}/suppliers`, {
		method: "POST",
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ?? "Error al crear proveedor",
		);
	}

	return response.json() as Promise<Supplier>;
}

async function updateSupplier(
	id: string,
	data: UpdateSupplierPayload,
): Promise<Supplier> {
	const response = await authFetch(`${API_BASE}/suppliers/${id}`, {
		method: "PATCH",
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ??
				"Error al actualizar proveedor",
		);
	}

	return response.json() as Promise<Supplier>;
}

async function deactivateSupplier(id: string): Promise<Supplier> {
	const response = await authFetch(`${API_BASE}/suppliers/${id}/deactivate`, {
		method: "POST",
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ??
				"Error al desactivar proveedor",
		);
	}

	return response.json() as Promise<Supplier>;
}

async function reactivateSupplier(id: string): Promise<Supplier> {
	const response = await authFetch(`${API_BASE}/suppliers/${id}/reactivate`, {
		method: "POST",
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ?? "Error al reactivar proveedor",
		);
	}

	return response.json() as Promise<Supplier>;
}

export function useSuppliers(filters: SupplierFilters) {
	return useQuery({
		queryKey: [...suppliersQueryKeyRoot, filters],
		queryFn: () => fetchSuppliers(filters),
	});
}

export function useCreateSupplier() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createSupplier,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: suppliersQueryKeyRoot });
		},
	});
}

export function useUpdateSupplier() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateSupplierPayload }) =>
			updateSupplier(id, data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: suppliersQueryKeyRoot });
		},
	});
}

export function useDeactivateSupplier() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deactivateSupplier,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: suppliersQueryKeyRoot });
		},
	});
}

export function useReactivateSupplier() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: reactivateSupplier,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: suppliersQueryKeyRoot });
		},
	});
}
