import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch.js";
import type {
	InventoryMovement,
	InventoryMovementFilters,
	PaginatedResponse,
} from "../types/api.js";

const API_BASE = "/api";

const DEFAULT_REFETCH = {
	staleTime: 30_000,
	refetchOnWindowFocus: true,
	refetchOnMount: true,
} as const;

async function fetchMovements(
	filters: InventoryMovementFilters,
): Promise<PaginatedResponse<InventoryMovement>> {
	const params = new URLSearchParams();
	if (filters.movementType) params.set("movementType", filters.movementType);
	if (filters.startDate) params.set("startDate", filters.startDate);
	if (filters.endDate) params.set("endDate", filters.endDate);
	if (filters.productId) params.set("productId", filters.productId);
	if (filters.supplierId) params.set("supplierId", filters.supplierId);
	if (filters.createdBy) params.set("createdBy", filters.createdBy);
	if (filters.sortBy) params.set("sortBy", filters.sortBy);
	if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
	if (filters.page) params.set("page", String(filters.page));
	if (filters.limit) params.set("limit", String(filters.limit));

	const res = await authFetch(
		`${API_BASE}/inventory/movements?${params.toString()}`,
	);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(
			(data as { message?: string }).message ??
				"Error al obtener movimientos de inventario",
		);
	}
	return res.json() as Promise<PaginatedResponse<InventoryMovement>>;
}

async function fetchMovementDetail(
	id: string,
): Promise<InventoryMovement> {
	const res = await authFetch(`${API_BASE}/inventory/movements/${id}`);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(
			(data as { message?: string }).message ??
				"Error al obtener detalle del movimiento",
		);
	}
	return res.json() as Promise<InventoryMovement>;
}

export const inventoryMovementsQueryKeyRoot = [
	"inventory-movements",
] as const;

const EXPORT_PAGE_SIZE = 100;

export async function fetchAllMovementsForExport(
	filters: Omit<InventoryMovementFilters, "page" | "limit">,
): Promise<InventoryMovement[]> {
	const baseParams = new URLSearchParams();
	if (filters.movementType) baseParams.set("movementType", filters.movementType);
	if (filters.startDate) baseParams.set("startDate", filters.startDate);
	if (filters.endDate) baseParams.set("endDate", filters.endDate);
	if (filters.productId) baseParams.set("productId", filters.productId);
	if (filters.supplierId) baseParams.set("supplierId", filters.supplierId);
	if (filters.createdBy) baseParams.set("createdBy", filters.createdBy);
	if (filters.sortBy) baseParams.set("sortBy", filters.sortBy);
	if (filters.sortOrder) baseParams.set("sortOrder", filters.sortOrder);
	baseParams.set("limit", String(EXPORT_PAGE_SIZE));

	const allData: InventoryMovement[] = [];
	let page = 1;
	let totalPages = 1;

	do {
		const params = new URLSearchParams(baseParams.toString());
		params.set("page", String(page));

		const res = await authFetch(
			`${API_BASE}/inventory/movements?${params.toString()}`,
		);
		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			throw new Error(
				(data as { message?: string }).message ??
					"Error al obtener movimientos para exportar",
			);
		}
		const json = (await res.json()) as PaginatedResponse<InventoryMovement>;
		allData.push(...json.data);
		totalPages = json.totalPages;
		page++;
	} while (page <= totalPages);

	return allData;
}

export function useInventoryMovements(filters: InventoryMovementFilters) {
	return useQuery({
		queryKey: [...inventoryMovementsQueryKeyRoot, "list", filters],
		queryFn: () => fetchMovements(filters),
		staleTime: DEFAULT_REFETCH.staleTime,
		refetchOnWindowFocus: DEFAULT_REFETCH.refetchOnWindowFocus,
		refetchOnMount: DEFAULT_REFETCH.refetchOnMount,
	});
}

export function useInventoryMovementDetail(id: string | null) {
	return useQuery({
		queryKey: [...inventoryMovementsQueryKeyRoot, "detail", id],
		queryFn: () => fetchMovementDetail(id as string),
		enabled: Boolean(id),
	});
}
