import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { InventoryMovement, PaginatedResponse } from "../types/api.js";
import { fetchAllMovementsForExport } from "./use-inventory-movements.js";

// Mock authFetch before importing the module under test
const mockAuthFetch = vi.fn();
vi.mock("@/lib/auth-fetch.js", () => ({
	authFetch: (...args: unknown[]) => mockAuthFetch(...args),
}));

const makeMovement = (id: string): InventoryMovement => ({
	id,
	productId: "prod-1",
	productCode: "PROD-001",
	productName: "Product One",
	supplierName: "Supplier A",
	type: "ENTRY",
	quantity: 10,
	previousQuantity: 0,
	newQuantity: 10,
	reason: null,
	referenceId: "ref-1",
	referenceType: "INVENTORY_ENTRY",
	userId: "user-1",
	userFullName: "Test User",
	createdAt: "2025-01-15T10:00:00Z",
});

const makePage = (
	data: InventoryMovement[],
	total: number,
	page: number,
	limit: number,
): PaginatedResponse<InventoryMovement> => ({
	data,
	total,
	page,
	limit,
	totalPages: Math.ceil(total / limit),
});

describe("fetchAllMovementsForExport", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("fetches a single page when all data fits", async () => {
		const items = [makeMovement("1"), makeMovement("2")];
		mockAuthFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(makePage(items, 2, 1, 100)),
		});

		const result = await fetchAllMovementsForExport({});

		expect(result).toHaveLength(2);
		expect(result).toEqual(items);
		expect(mockAuthFetch).toHaveBeenCalledTimes(1);
	});

	it("loops through multiple pages until all data is collected", async () => {
		const page1 = [makeMovement("1"), makeMovement("2")];
		const page2 = [makeMovement("3")];

		mockAuthFetch
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(makePage(page1, 3, 1, 2)),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(makePage(page2, 3, 2, 2)),
			});

		const result = await fetchAllMovementsForExport({});

		expect(result).toHaveLength(3);
		expect(result.map((m) => m.id)).toEqual(["1", "2", "3"]);
		expect(mockAuthFetch).toHaveBeenCalledTimes(2);
	});

	it("passes filters through to the query string on each page request", async () => {
		mockAuthFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(makePage([], 0, 1, 100)),
		});

		await fetchAllMovementsForExport({
			movementType: "ENTRY",
			productId: "prod-123",
			sortBy: "createdAt",
			sortOrder: "asc",
		});

		const url = mockAuthFetch.mock.calls[0][0] as string;
		expect(url).toContain("movementType=ENTRY");
		expect(url).toContain("productId=prod-123");
		expect(url).toContain("sortBy=createdAt");
		expect(url).toContain("sortOrder=asc");
		expect(url).toContain("limit=100");
		expect(url).toContain("page=1");
	});

	it("increments page parameter on subsequent requests", async () => {
		mockAuthFetch
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(makePage([makeMovement("1")], 2, 1, 1)),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(makePage([makeMovement("2")], 2, 2, 1)),
			});

		await fetchAllMovementsForExport({});

		const url1 = mockAuthFetch.mock.calls[0][0] as string;
		const url2 = mockAuthFetch.mock.calls[1][0] as string;
		expect(url1).toContain("page=1");
		expect(url2).toContain("page=2");
	});

	it("throws when the API returns an error response", async () => {
		mockAuthFetch.mockResolvedValue({
			ok: false,
			json: () => Promise.resolve({ message: "Unauthorized" }),
		});

		await expect(fetchAllMovementsForExport({})).rejects.toThrow(
			"Unauthorized",
		);
	});
});
