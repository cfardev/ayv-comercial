import { afterEach, describe, expect, it, vi } from "vitest";
import type { InventoryMovement } from "../types/api.js";

// vi.mock is hoisted — define mocks inline
vi.mock("xlsx", () => ({
	aoa_to_sheet: vi.fn(() => ({})),
	book_new: vi.fn(() => ({})),
	book_append_sheet: vi.fn(),
	writeFile: vi.fn(),
	utils: {
		aoa_to_sheet: vi.fn(() => ({})),
		book_new: vi.fn(() => ({})),
		book_append_sheet: vi.fn(),
	},
}));

vi.mock("jspdf", () => ({
	default: vi.fn().mockImplementation(() => ({
		setFontSize: vi.fn(),
		text: vi.fn(),
		save: vi.fn(),
	})),
}));

vi.mock("jspdf-autotable", () => ({
	default: vi.fn(),
}));

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
	exportMovementsToExcel,
	exportMovementsToPdf,
} from "./export-movements.js";

const makeMovement = (
	overrides?: Partial<InventoryMovement>,
): InventoryMovement => ({
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

function clearAllMockCalls() {
	vi.mocked(XLSX.utils.aoa_to_sheet).mockClear();
	vi.mocked(XLSX.utils.book_new).mockClear();
	vi.mocked(XLSX.utils.book_append_sheet).mockClear();
	vi.mocked(XLSX.writeFile).mockClear();
	vi.mocked(jsPDF).mockClear();
	vi.mocked(autoTable).mockClear();
}

describe("exportMovementsToExcel", () => {
	afterEach(() => {
		clearAllMockCalls();
	});

	it("calls XLSX utils to build workbook and writeFile with correct filename", () => {
		const data = [makeMovement()];
		exportMovementsToExcel(data);

		expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalled();
		expect(XLSX.utils.book_new).toHaveBeenCalled();
		expect(XLSX.utils.book_append_sheet).toHaveBeenCalled();
		expect(XLSX.writeFile).toHaveBeenCalledWith(
			expect.any(Object),
			"movimientos-inventario.xlsx",
		);
	});

	it("includes a header row plus one data row per movement", () => {
		const data = [makeMovement(), makeMovement({ id: "mov-2" })];
		exportMovementsToExcel(data);

		const aoaCall = vi.mocked(XLSX.utils.aoa_to_sheet).mock.calls[0];
		const sheetData = aoaCall[0] as string[][];

		expect(sheetData[0]).toContain("Fecha");
		expect(sheetData[0]).toContain("Tipo");
		expect(sheetData[0]).toContain("Producto");
		expect(sheetData).toHaveLength(3);
	});
});

describe("exportMovementsToPdf", () => {
	afterEach(() => {
		clearAllMockCalls();
	});

	it("creates a PDF with landscape orientation and calls save", () => {
		const data = [makeMovement()];
		exportMovementsToPdf(data);

		expect(jsPDF).toHaveBeenCalledWith({ orientation: "landscape" });
		const doc = vi.mocked(jsPDF).mock.results[0].value;
		expect(doc.save).toHaveBeenCalledWith("movimientos-inventario.pdf");
	});

	it("calls autoTable with headers and body rows", () => {
		const data = [makeMovement()];
		exportMovementsToPdf(data);

		expect(autoTable).toHaveBeenCalledWith(
			expect.any(Object),
			expect.objectContaining({
				head: expect.arrayContaining([
					expect.arrayContaining(["Fecha", "Tipo", "Producto"]),
				]),
				body: expect.any(Array),
			}),
		);
	});
});
