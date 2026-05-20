import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { InventoryMovement } from "../types/api.js";
import { MovementsTable } from "./movements-table.js";

const makeMovement = (overrides?: Partial<InventoryMovement>): InventoryMovement => ({
	id: "mov-1",
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
	...overrides,
});

let container: HTMLDivElement;

beforeEach(() => {
	container = document.createElement("div");
	document.body.appendChild(container);
});

afterEach(() => {
	// Unmount and cleanup
	const root = (container as any).__root;
	if (root) {
		root.unmount();
	}
	document.body.removeChild(container);
	vi.restoreAllMocks();
});

function renderTable(
	props: React.ComponentProps<typeof MovementsTable>,
): HTMLDivElement {
	const root = createRoot(container);
	(container as any).__root = root;
	flushSync(() => {
		root.render(<MovementsTable {...props} />);
	});
	return container;
}

describe("MovementsTable", () => {
	it("shows 5 skeleton rows when loading", () => {
		renderTable({ items: [], isLoading: true });

		const rows = container.querySelectorAll("tbody tr");
		expect(rows).toHaveLength(5);
	});

	it("shows empty state message when no items and not loading", () => {
		renderTable({ items: [], isLoading: false });

		expect(container.textContent).toContain(
			"No se encontraron movimientos con los filtros seleccionados",
		);
	});

	it("renders movement data with product name and code", () => {
		const items = [makeMovement()];
		renderTable({ items, isLoading: false });

		expect(container.textContent).toContain("Product One");
		expect(container.textContent).toContain("PROD-001");
		expect(container.textContent).toContain("Test User");
	});

	it("renders ENTRY type label as Entrada", () => {
		const items = [makeMovement({ type: "ENTRY" })];
		renderTable({ items, isLoading: false });

		expect(container.textContent).toContain("Entrada");
	});

	it("renders EXIT type label as Salida", () => {
		const items = [makeMovement({ type: "EXIT" })];
		renderTable({ items, isLoading: false });

		expect(container.textContent).toContain("Salida");
	});

	it("renders ADJUSTMENT type label as Ajuste", () => {
		const items = [makeMovement({ type: "ADJUSTMENT" })];
		renderTable({ items, isLoading: false });

		expect(container.textContent).toContain("Ajuste");
	});

	it("shows sortable column headers for Fecha, Producto, Cantidad", () => {
		const items = [makeMovement()];
		renderTable({ items, isLoading: false });

		expect(container.textContent).toContain("Fecha");
		expect(container.textContent).toContain("Producto");
		expect(container.textContent).toContain("Cantidad");
	});

	it("calls onSort when sortable header button is clicked", () => {
		const onSort = vi.fn();
		const items = [makeMovement()];
		renderTable({
			items,
			isLoading: false,
			sortBy: "createdAt",
			sortOrder: "desc",
			onSort,
		});

		// Find all buttons; the Producto sortable header is a button
		const buttons = container.querySelectorAll("button");
		// The Producto button contains the text "Producto"
		const productoBtn = Array.from(buttons).find((b) =>
			b.textContent?.includes("Producto"),
		);
		expect(productoBtn).toBeDefined();
		productoBtn?.click();

		expect(onSort).toHaveBeenCalledWith("productName");
	});

	it("calls onRowClick when a table row is clicked", () => {
		const onRowClick = vi.fn();
		const movement = makeMovement();
		renderTable({ items: [movement], isLoading: false, onRowClick });

		const row = container.querySelector("tbody tr");
		expect(row).not.toBeNull();
		row?.dispatchEvent(new Event("click", { bubbles: true }));

		expect(onRowClick).toHaveBeenCalledWith(movement);
	});

	it("renders Detalle button for each row", () => {
		const items = [makeMovement()];
		renderTable({ items, isLoading: false });

		expect(container.textContent).toContain("Detalle");
	});
});
