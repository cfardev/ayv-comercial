import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch.js";

const API_BASE = "/api";

const brandsQueryKeyRoot = ["brands"] as const;

export interface BrandSummary {
	id: string;
	name: string;
}

export interface BrandListFilters {
	search?: string;
	limit?: number;
}

async function fetchBrands(filters: BrandListFilters): Promise<BrandSummary[]> {
	const params = new URLSearchParams();
	if (filters.search?.trim()) params.set("search", filters.search.trim());
	params.set("limit", String(Math.min(100, Math.max(1, filters.limit ?? 50))));

	const res = await authFetch(`${API_BASE}/brands?${params.toString()}`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(
			(data as { message?: string }).message ?? "Error al obtener marcas",
		);
	}
	return res.json() as Promise<BrandSummary[]>;
}

export function useBrands(filters: BrandListFilters) {
	const searchNorm = filters.search?.trim() ?? "";
	const limit = filters.limit ?? 50;

	return useQuery({
		queryKey: [...brandsQueryKeyRoot, searchNorm, limit],
		queryFn: () => fetchBrands({ ...filters, limit }),
	});
}

export { brandsQueryKeyRoot };
