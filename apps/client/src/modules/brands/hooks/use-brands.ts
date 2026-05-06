import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch.js";

const API_BASE = "/api";

export const brandsPickerQueryKeyRoot = ["brands", "picker"] as const;
export const brandsAdminQueryKeyRoot = ["brands", "admin"] as const;

/** @deprecated Use brandsPickerQueryKeyRoot or brandsAdminQueryKeyRoot */
export const brandsQueryKeyRoot = brandsPickerQueryKeyRoot;

export interface BrandSummary {
	id: string;
	name: string;
}

export interface BrandListFilters {
	search?: string;
	limit?: number;
}

export interface Brand {
	id: string;
	name: string;
	status: boolean;
	logoUrl: string | null;
	productCount: number;
	createdAt: string;
	updatedAt: string;
}

export interface BrandAdminFilters {
	search?: string;
	status?: "true" | "false" | "ALL";
	page?: number;
	limit?: number;
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface CreateBrandPayload {
	name: string;
	logoUrl?: string | null;
}

export interface UpdateBrandPayload {
	name?: string;
	logoUrl?: string | null;
}

async function fetchBrandsPicker(
	filters: BrandListFilters,
): Promise<BrandSummary[]> {
	const params = new URLSearchParams();
	if (filters.search?.trim()) params.set("search", filters.search.trim());
	params.set("limit", String(Math.min(100, Math.max(1, filters.limit ?? 50))));

	const res = await authFetch(`${API_BASE}/brands/picker?${params.toString()}`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(
			(data as { message?: string }).message ?? "Error al obtener marcas",
		);
	}
	return res.json() as Promise<BrandSummary[]>;
}

async function fetchBrandsAdmin(
	filters: BrandAdminFilters,
): Promise<PaginatedResponse<Brand>> {
	const params = new URLSearchParams();
	if (filters.search) params.set("search", filters.search);
	if (filters.status !== undefined) params.set("status", filters.status);
	if (filters.page) params.set("page", String(filters.page));
	if (filters.limit) params.set("limit", String(filters.limit));

	const res = await authFetch(`${API_BASE}/brands?${params.toString()}`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(
			(data as { message?: string }).message ?? "Error al obtener marcas",
		);
	}
	return res.json() as Promise<PaginatedResponse<Brand>>;
}

async function fetchBrand(id: string): Promise<Brand> {
	const res = await authFetch(`${API_BASE}/brands/${id}`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(
			(data as { message?: string }).message ?? "Error al obtener marca",
		);
	}
	return res.json() as Promise<Brand>;
}

async function createBrand(data: CreateBrandPayload): Promise<Brand> {
	const res = await authFetch(`${API_BASE}/brands`, {
		method: "POST",
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ?? "Error al crear marca",
		);
	}
	return res.json() as Promise<Brand>;
}

async function updateBrand(
	id: string,
	data: UpdateBrandPayload,
): Promise<Brand> {
	const res = await authFetch(`${API_BASE}/brands/${id}`, {
		method: "PATCH",
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ?? "Error al actualizar marca",
		);
	}
	return res.json() as Promise<Brand>;
}

async function deactivateBrand(id: string): Promise<Brand> {
	const res = await authFetch(`${API_BASE}/brands/${id}/deactivate`, {
		method: "POST",
	});
	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ?? "Error al desactivar marca",
		);
	}
	return res.json() as Promise<Brand>;
}

async function reactivateBrand(id: string): Promise<Brand> {
	const res = await authFetch(`${API_BASE}/brands/${id}/reactivate`, {
		method: "POST",
	});
	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ?? "Error al reactivar marca",
		);
	}
	return res.json() as Promise<Brand>;
}

export function useBrands(filters: BrandListFilters) {
	const searchNorm = filters.search?.trim() ?? "";
	const limit = filters.limit ?? 50;

	return useQuery({
		queryKey: [...brandsPickerQueryKeyRoot, searchNorm, limit],
		queryFn: () => fetchBrandsPicker({ ...filters, limit }),
	});
}

export function useBrandsList(filters: BrandAdminFilters) {
	return useQuery({
		queryKey: [...brandsAdminQueryKeyRoot, filters],
		queryFn: () => fetchBrandsAdmin(filters),
	});
}

export function useBrand(id: string) {
	return useQuery({
		queryKey: [...brandsAdminQueryKeyRoot, id],
		queryFn: () => fetchBrand(id),
		enabled: !!id,
	});
}

export function useCreateBrand() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createBrand,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: brandsAdminQueryKeyRoot });
			void queryClient.invalidateQueries({
				queryKey: brandsPickerQueryKeyRoot,
			});
		},
	});
}

export function useUpdateBrand() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateBrandPayload }) =>
			updateBrand(id, data),
		onSuccess: (_, variables) => {
			void queryClient.invalidateQueries({ queryKey: brandsAdminQueryKeyRoot });
			void queryClient.invalidateQueries({
				queryKey: brandsPickerQueryKeyRoot,
			});
			void queryClient.invalidateQueries({
				queryKey: [...brandsAdminQueryKeyRoot, variables.id],
			});
		},
	});
}

export function useDeactivateBrand() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deactivateBrand,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: brandsAdminQueryKeyRoot });
			void queryClient.invalidateQueries({
				queryKey: brandsPickerQueryKeyRoot,
			});
		},
	});
}

export function useReactivateBrand() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: reactivateBrand,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: brandsAdminQueryKeyRoot });
			void queryClient.invalidateQueries({
				queryKey: brandsPickerQueryKeyRoot,
			});
		},
	});
}
