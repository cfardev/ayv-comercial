import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch.js";
import type {
	CreatePurchaseOrderPayload,
	PaginatedResponse,
	PurchaseOrder,
	PurchaseOrderFilters,
	PurchaseOrderStatus,
	SupplierLite,
	SupplierProductLite,
} from "../types/api.js";

const API_BASE = "/api";
export const purchaseOrdersQueryKeyRoot = ["purchase-orders"] as const;

async function fetchPurchaseOrders(
	filters: PurchaseOrderFilters,
): Promise<PaginatedResponse<PurchaseOrder>> {
	const params = new URLSearchParams();
	if (filters.search) params.set("search", filters.search);
	if (filters.status?.length) params.set("status", filters.status.join(","));
	if (filters.fromDate) params.set("fromDate", filters.fromDate);
	if (filters.toDate) params.set("toDate", filters.toDate);
	if (filters.page) params.set("page", String(filters.page));
	if (filters.limit) params.set("limit", String(filters.limit));

	const response = await authFetch(
		`${API_BASE}/purchase-orders?${params.toString()}`,
	);
	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ??
				"Error al obtener ordenes de compra",
		);
	}

	return response.json() as Promise<PaginatedResponse<PurchaseOrder>>;
}

async function fetchPurchaseOrder(id: string): Promise<PurchaseOrder> {
	const response = await authFetch(`${API_BASE}/purchase-orders/${id}`);
	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ?? "Error al obtener la orden",
		);
	}
	return response.json() as Promise<PurchaseOrder>;
}

async function fetchSuppliersLite(): Promise<SupplierLite[]> {
	const response = await authFetch(
		`${API_BASE}/suppliers?status=true&limit=100`,
	);
	if (!response.ok) throw new Error("Error al cargar proveedores");
	const data = (await response.json()) as {
		data: Array<{ id: string; name: string }>;
	};
	return data.data.map((item) => ({ id: item.id, name: item.name }));
}

async function fetchProductsBySupplier(
	supplierId: string,
): Promise<SupplierProductLite[]> {
	const response = await authFetch(
		`${API_BASE}/purchase-orders/products-by-supplier?supplierId=${supplierId}`,
	);
	if (!response.ok) throw new Error("Error al cargar productos");
	return response.json() as Promise<SupplierProductLite[]>;
}

async function createPurchaseOrder(
	payload: CreatePurchaseOrderPayload,
): Promise<PurchaseOrder> {
	const response = await authFetch(`${API_BASE}/purchase-orders`, {
		method: "POST",
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ?? "Error al crear orden",
		);
	}
	return response.json() as Promise<PurchaseOrder>;
}

async function updatePurchaseOrderStatus(
	id: string,
	status: PurchaseOrderStatus,
): Promise<PurchaseOrder> {
	const response = await authFetch(`${API_BASE}/purchase-orders/${id}/status`, {
		method: "PATCH",
		body: JSON.stringify({ status }),
	});
	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ?? "Error al actualizar estado",
		);
	}
	return response.json() as Promise<PurchaseOrder>;
}

export function usePurchaseOrders(filters: PurchaseOrderFilters) {
	return useQuery({
		queryKey: [...purchaseOrdersQueryKeyRoot, filters],
		queryFn: () => fetchPurchaseOrders(filters),
	});
}

export function usePurchaseOrder(id: string | null) {
	return useQuery({
		queryKey: [...purchaseOrdersQueryKeyRoot, "detail", id],
		queryFn: () => fetchPurchaseOrder(id as string),
		enabled: Boolean(id),
	});
}

export function useSuppliersLite() {
	return useQuery({
		queryKey: ["suppliers-lite"],
		queryFn: fetchSuppliersLite,
	});
}

export function useSupplierProducts(supplierId: string) {
	return useQuery({
		queryKey: ["supplier-products", supplierId],
		queryFn: () => fetchProductsBySupplier(supplierId),
		enabled: Boolean(supplierId),
	});
}

export function useCreatePurchaseOrder() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createPurchaseOrder,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: purchaseOrdersQueryKeyRoot,
			});
		},
	});
}

export function useUpdatePurchaseOrderStatus() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, status }: { id: string; status: PurchaseOrderStatus }) =>
			updatePurchaseOrderStatus(id, status),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: purchaseOrdersQueryKeyRoot,
			});
		},
	});
}
