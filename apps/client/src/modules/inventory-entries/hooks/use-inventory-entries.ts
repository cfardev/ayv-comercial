import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch.js";
import type {
	CreateInventoryEntryPayload,
	InventoryEntry,
	InventoryEntryFilters,
	PaginatedResponse,
} from "../types/api.js";

const API_BASE = "/api";
export const inventoryEntriesQueryKeyRoot = ["inventory-entries"] as const;
const productsQueryKeyRoot = ["products"] as const;
const purchaseOrdersQueryKeyRoot = ["purchase-orders"] as const;

async function fetchInventoryEntries(
	filters: InventoryEntryFilters,
): Promise<PaginatedResponse<InventoryEntry>> {
	const params = new URLSearchParams();
	if (filters.search) params.set("search", filters.search);
	if (filters.fromDate) params.set("fromDate", filters.fromDate);
	if (filters.toDate) params.set("toDate", filters.toDate);
	if (filters.page) params.set("page", String(filters.page));
	if (filters.limit) params.set("limit", String(filters.limit));

	const response = await authFetch(
		`${API_BASE}/inventory/entries?${params.toString()}`,
	);
	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ??
				"Error al obtener entradas de inventario",
		);
	}

	return response.json() as Promise<PaginatedResponse<InventoryEntry>>;
}

async function fetchInventoryEntry(id: string): Promise<InventoryEntry> {
	const response = await authFetch(`${API_BASE}/inventory/entries/${id}`);
	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ??
				"Error al obtener la entrada de inventario",
		);
	}
	return response.json() as Promise<InventoryEntry>;
}

async function createInventoryEntry(
	payload: CreateInventoryEntryPayload,
): Promise<InventoryEntry> {
	const response = await authFetch(`${API_BASE}/inventory/entries`, {
		method: "POST",
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ?? "Error al crear entrada",
		);
	}
	return response.json() as Promise<InventoryEntry>;
}

export function useInventoryEntries(filters: InventoryEntryFilters) {
	return useQuery({
		queryKey: [...inventoryEntriesQueryKeyRoot, filters],
		queryFn: () => fetchInventoryEntries(filters),
	});
}

export function useInventoryEntry(id: string | null) {
	return useQuery({
		queryKey: [...inventoryEntriesQueryKeyRoot, "detail", id],
		queryFn: () => fetchInventoryEntry(id as string),
		enabled: Boolean(id),
	});
}

export function useCreateInventoryEntry() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createInventoryEntry,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: inventoryEntriesQueryKeyRoot,
			});
			void queryClient.invalidateQueries({
				queryKey: productsQueryKeyRoot,
			});
			void queryClient.invalidateQueries({
				queryKey: purchaseOrdersQueryKeyRoot,
			});
		},
	});
}
