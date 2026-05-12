import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch.js";
import type {
	CreateCustomerPayload,
	Customer,
	CustomerFilters,
	PaginatedResponse,
	UpdateCustomerPayload,
} from "../types/api.js";

const API_BASE = "/api";
export const customersQueryKeyRoot = ["customers"] as const;

async function fetchCustomers(
	filters: CustomerFilters,
): Promise<PaginatedResponse<Customer>> {
	const params = new URLSearchParams();
	if (filters.search) params.set("search", filters.search);
	if (filters.personType) params.set("personType", filters.personType);
	if (filters.isActive !== undefined) params.set("isActive", filters.isActive);
	if (filters.page) params.set("page", String(filters.page));
	if (filters.limit) params.set("limit", String(filters.limit));

	const response = await authFetch(
		`${API_BASE}/customers?${params.toString()}`,
	);
	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ?? "Error al obtener clientes",
		);
	}

	return response.json() as Promise<PaginatedResponse<Customer>>;
}

async function createCustomer(data: CreateCustomerPayload): Promise<Customer> {
	const response = await authFetch(`${API_BASE}/customers`, {
		method: "POST",
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ?? "Error al crear cliente",
		);
	}

	return response.json() as Promise<Customer>;
}

async function updateCustomer(
	id: string,
	data: UpdateCustomerPayload,
): Promise<Customer> {
	const response = await authFetch(`${API_BASE}/customers/${id}`, {
		method: "PATCH",
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ?? "Error al actualizar cliente",
		);
	}

	return response.json() as Promise<Customer>;
}

async function deactivateCustomer(id: string): Promise<Customer> {
	const response = await authFetch(`${API_BASE}/customers/${id}/deactivate`, {
		method: "PATCH",
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ?? "Error al desactivar cliente",
		);
	}

	return response.json() as Promise<Customer>;
}

async function activateCustomer(id: string): Promise<Customer> {
	const response = await authFetch(`${API_BASE}/customers/${id}/activate`, {
		method: "PATCH",
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ?? "Error al activar cliente",
		);
	}

	return response.json() as Promise<Customer>;
}

export function useCustomers(filters: CustomerFilters) {
	return useQuery({
		queryKey: [...customersQueryKeyRoot, filters],
		queryFn: () => fetchCustomers(filters),
	});
}

export function useCreateCustomer() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createCustomer,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: customersQueryKeyRoot });
		},
	});
}

export function useUpdateCustomer() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateCustomerPayload }) =>
			updateCustomer(id, data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: customersQueryKeyRoot });
		},
	});
}

export function useDeactivateCustomer() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deactivateCustomer,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: customersQueryKeyRoot });
		},
	});
}

export function useActivateCustomer() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: activateCustomer,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: customersQueryKeyRoot });
		},
	});
}
