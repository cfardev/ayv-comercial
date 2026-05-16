import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch.js";
import type {
	PaginatedResponse,
	StockFilters,
	StockItem,
} from "../types/api.js";

const API_BASE = "/api";

/** Default refetch configuration — override via options if needed. */
const DEFAULT_REFETCH = {
	staleTime: 30_000, // 30s — data considered fresh
	refetchInterval: 60_000, // 60s — background poll for stock changes
	refetchOnWindowFocus: true,
	refetchOnMount: true,
} as const;

async function fetchStock(
	filters: StockFilters,
): Promise<PaginatedResponse<StockItem>> {
	const params = new URLSearchParams();
	if (filters.search) params.set("search", filters.search);
	if (filters.categoryId) params.set("categoryId", filters.categoryId);
	if (filters.brandId) params.set("brandId", filters.brandId);
	if (filters.supplierId) params.set("supplierId", filters.supplierId);
	if (filters.stockStatus) params.set("stockStatus", filters.stockStatus);
	if (filters.isActive) params.set("isActive", filters.isActive);
	if (filters.sortBy) params.set("sortBy", filters.sortBy);
	if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
	if (filters.page) params.set("page", String(filters.page));
	if (filters.limit) params.set("limit", String(filters.limit));

	const res = await authFetch(
		`${API_BASE}/inventory/stock?${params.toString()}`,
	);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(
			(data as { message?: string }).message ?? "Error al obtener existencias",
		);
	}
	return res.json() as Promise<PaginatedResponse<StockItem>>;
}

async function fetchStockDetail(id: string): Promise<StockItem> {
	const res = await authFetch(`${API_BASE}/inventory/stock/${id}`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(
			(data as { message?: string }).message ??
				"Error al obtener detalle de existencia",
		);
	}
	return res.json() as Promise<StockItem>;
}

export const stockQueryKeyRoot = ["inventory-stock"] as const;

export interface UseStockOptions {
	/** Override staleTime (ms). Defaults to 30s. */
	staleTime?: number;
	/** Override refetchInterval (ms). Set false to disable polling. Defaults to 60s. */
	refetchInterval?: number | false;
}

export function useStock(filters: StockFilters, options?: UseStockOptions) {
	return useQuery({
		queryKey: [...stockQueryKeyRoot, "list", filters],
		queryFn: () => fetchStock(filters),
		staleTime: options?.staleTime ?? DEFAULT_REFETCH.staleTime,
		refetchInterval:
			options?.refetchInterval ?? DEFAULT_REFETCH.refetchInterval,
		refetchOnWindowFocus: DEFAULT_REFETCH.refetchOnWindowFocus,
		refetchOnMount: DEFAULT_REFETCH.refetchOnMount,
	});
}

export function useStockDetail(id: string | null) {
	return useQuery({
		queryKey: [...stockQueryKeyRoot, "detail", id],
		queryFn: () => fetchStockDetail(id as string),
		enabled: Boolean(id),
	});
}
