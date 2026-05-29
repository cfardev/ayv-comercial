import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { InventoryMovement, MovementType } from "../types/api.js";

const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
	ENTRY: "Entrada",
	EXIT: "Salida",
	ADJUSTMENT: "Ajuste",
};

function formatDate(value: string): string {
	return new Date(value).toLocaleString("es-AR");
}

function buildRows(data: InventoryMovement[]): string[][] {
	return data.map((m) => [
		formatDate(m.createdAt),
		MOVEMENT_TYPE_LABELS[m.type],
		`${m.productName} (${m.productCode})`,
		m.supplierName ?? "—",
		String(m.quantity),
		m.referenceId ?? "—",
		m.userFullName,
		m.previousQuantity !== null ? String(m.previousQuantity) : "—",
		m.newQuantity !== null ? String(m.newQuantity) : "—",
		m.reason ?? "—",
	]);
}

const HEADERS = [
	"Fecha",
	"Tipo",
	"Producto",
	"Proveedor",
	"Cantidad",
	"Doc. referencia",
	"Responsable",
	"Stock anterior",
	"Stock nuevo",
	"Motivo",
];

export function exportMovementsToExcel(data: InventoryMovement[]): void {
	const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...buildRows(data)]);

	// Column widths
	ws["!cols"] = HEADERS.map(() => ({ wch: 20 }));

	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, "Movimientos");
	XLSX.writeFile(wb, "movimientos-inventario.xlsx");
}

export function exportMovementsToPdf(data: InventoryMovement[]): void {
	const doc = new jsPDF({ orientation: "landscape" });

	doc.setFontSize(16);
	doc.text("Movimientos de inventario", 14, 15);
	doc.setFontSize(10);
	doc.text(
		`Total: ${data.length} movimientos — Generado el ${new Date().toLocaleString("es-AR")}`,
		14,
		22,
	);

	autoTable(doc, {
		head: [HEADERS],
		body: buildRows(data),
		startY: 28,
		styles: { fontSize: 7, cellPadding: 2 },
		headStyles: { fillColor: [59, 130, 246] },
		alternateRowStyles: { fillColor: [245, 245, 245] },
	});

	doc.save("movimientos-inventario.pdf");
}
