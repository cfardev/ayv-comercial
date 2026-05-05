import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch.js";
import type {
	CreateProductPayload,
	PaginatedResponse,
	Product,
	ProductFilters,
	UpdateProductPayload,
} from "../types/api.js";

const API_BASE = "/api";

async function fetchProducts(
	filters: ProductFilters,
): Promise<PaginatedResponse<Product>> {
	const params = new URLSearchParams();
	if (filters.search) params.set("search", filters.search);
	if (filters.status && filters.status !== "ALL")
		params.set("status", filters.status);
	if (filters.categoryId) params.set("categoryId", filters.categoryId);
	if (filters.minPrice !== undefined)
		params.set("minPrice", String(filters.minPrice));
	if (filters.maxPrice !== undefined)
		params.set("maxPrice", String(filters.maxPrice));
	if (filters.page) params.set("page", String(filters.page));
	if (filters.limit) params.set("limit", String(filters.limit));

	const res = await authFetch(`${API_BASE}/products?${params.toString()}`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(
			(data as { message?: string }).message ?? "Error al obtener productos",
		);
	}
	return res.json() as Promise<PaginatedResponse<Product>>;
}

async function fetchProduct(id: string): Promise<Product> {
	const res = await authFetch(`${API_BASE}/products/${id}`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(
			(data as { message?: string }).message ?? "Error al obtener producto",
		);
	}
	return res.json() as Promise<Product>;
}

async function createProduct(data: CreateProductPayload): Promise<Product> {
	const res = await authFetch(`${API_BASE}/products`, {
		method: "POST",
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(
			(err as { message?: string }).message ?? "Error al crear producto",
		);
	}
	return res.json() as Promise<Product>;
}

async function updateProduct(
	id: string,
	data: UpdateProductPayload,
): Promise<Product> {
	const res = await authFetch(`${API_BASE}/products/${id}`, {
		method: "PATCH",
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(
			(err as { message?: string }).message ?? "Error al actualizar producto",
		);
	}
	return res.json() as Promise<Product>;
}

async function deactivateProduct(id: string): Promise<Product> {
	const res = await authFetch(`${API_BASE}/products/${id}/deactivate`, {
		method: "POST",
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(
			(err as { message?: string }).message ?? "Error al desactivar producto",
		);
	}
	return res.json() as Promise<Product>;
}

async function reactivateProduct(id: string): Promise<Product> {
	const res = await authFetch(`${API_BASE}/products/${id}/reactivate`, {
		method: "POST",
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(
			(err as { message?: string }).message ?? "Error al reactivar producto",
		);
	}
	return res.json() as Promise<Product>;
}

const productsKey = ["products"] as const;

export function useProducts(filters: ProductFilters) {
	return useQuery({
		queryKey: [...productsKey, filters],
		queryFn: () => fetchProducts(filters),
	});
}

export function useProduct(id: string | null) {
	return useQuery({
		queryKey: [...productsKey, id],
		queryFn: () => fetchProduct(id as string),
		enabled: Boolean(id),
	});
}

export function useCreateProduct() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: createProduct,
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: productsKey });
		},
	});
}

export function useUpdateProduct() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateProductPayload }) =>
			updateProduct(id, data),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: productsKey });
		},
	});
}

export function useDeactivateProduct() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: deactivateProduct,
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: productsKey });
		},
	});
}

export function useReactivateProduct() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: reactivateProduct,
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: productsKey });
		},
	});
}
