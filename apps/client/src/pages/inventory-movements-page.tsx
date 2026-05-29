import { IconCalendar, IconFileSpreadsheet, IconFileText } from "@tabler/icons-react";
import { useState } from "react";
import { DataTablePagination } from "@/components/data-table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { usePaginationState } from "@/hooks/use-pagination-state";
import { useAuth } from "@/lib/auth-context.js";
import {
	hasPermissionOrSystemAdmin,
	PERMISSION_KEYS,
} from "@/lib/permission-keys.js";
import {
	ProductCombobox,
	SupplierCombobox,
	UserCombobox,
} from "@/modules/inventory-movements/components/index.js";
import { MovementsTable } from "@/modules/inventory-movements/components/movements-table.js";
import {
	useInventoryMovementDetail,
	useInventoryMovements,
} from "@/modules/inventory-movements/hooks/use-inventory-movements.js";
import type {
	InventoryMovement,
	MovementType,
} from "@/modules/inventory-movements/types/api.js";
import {
	exportMovementsToExcel,
	exportMovementsToPdf,
} from "@/modules/inventory-movements/utils/export-movements.js";
import { fetchAllMovementsForExport } from "@/modules/inventory-movements/hooks/use-inventory-movements.js";

const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
	ENTRY: "Entrada",
	EXIT: "Salida",
	ADJUSTMENT: "Ajuste",
};

const movementTypeOptions: { value: MovementType | "ALL"; label: string }[] = [
	{ value: "ALL", label: "Todos los tipos" },
	{ value: "ENTRY", label: "Entrada" },
	{ value: "EXIT", label: "Salida" },
	{ value: "ADJUSTMENT", label: "Ajuste" },
];

function formatDateTime(value: string): string {
	return new Date(value).toLocaleString("es-AR");
}

export function InventoryMovementsPage() {
	const { user } = useAuth();
	const canRead = hasPermissionOrSystemAdmin(
		user?.permissions,
		PERMISSION_KEYS.INVENTORY_MOVEMENTS_READ,
		user?.role?.slug,
	);

	const [movementType, setMovementType] = useState<MovementType | "ALL">("ALL");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [productId, setProductId] = useState("");
	const [supplierId, setSupplierId] = useState("");
	const [createdBy, setCreatedBy] = useState("");
	const { page, setPage, pageSize, setPageSize, resetPage } =
		usePaginationState();
	const [sortBy, setSortBy] = useState("createdAt");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [selectedMovementId, setSelectedMovementId] = useState<string | null>(
		null,
	);
	const [isExporting, setIsExporting] = useState(false);

	const { data: movementsData, isLoading } = useInventoryMovements({
		movementType: movementType === "ALL" ? undefined : movementType,
		startDate: startDate || undefined,
		endDate: endDate || undefined,
		productId: productId || undefined,
		supplierId: supplierId || undefined,
		createdBy: createdBy || undefined,
		sortBy,
		sortOrder,
		page,
		limit: pageSize,
	});

	const items = movementsData?.data ?? [];
	const total = movementsData?.total ?? 0;
	const totalPages = movementsData?.totalPages ?? 1;

	function handleSort(column: string) {
		if (sortBy === column) {
			setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
		} else {
			setSortBy(column);
			setSortOrder("desc");
		}
	}

	function handleRowClick(movement: InventoryMovement) {
		setSelectedMovementId(movement.id);
	}

	function handleClearFilters() {
		setMovementType("ALL");
		setStartDate("");
		setEndDate("");
		setProductId("");
		setSupplierId("");
		setCreatedBy("");
		resetPage();
	}

	async function handleExport(format: "excel" | "pdf") {
		setIsExporting(true);
		try {
			const data = await fetchAllMovementsForExport({
				movementType: movementType === "ALL" ? undefined : movementType,
				startDate: startDate || undefined,
				endDate: endDate || undefined,
				productId: productId || undefined,
				supplierId: supplierId || undefined,
				createdBy: createdBy || undefined,
				sortBy,
				sortOrder,
			});
			if (data.length === 0) {
				alert("No hay movimientos para exportar con los filtros actuales.");
				return;
			}
			if (format === "excel") {
				exportMovementsToExcel(data);
			} else {
				exportMovementsToPdf(data);
			}
		} catch {
			alert("Error al exportar los movimientos. Intente nuevamente.");
		} finally {
			setIsExporting(false);
		}
	}

	const hasActiveFilters =
		movementType !== "ALL" ||
		startDate ||
		endDate ||
		productId ||
		supplierId ||
		createdBy;

	if (!canRead) {
		return (
			<p className="text-sm text-muted-foreground">
				No tienes permisos para ver movimientos de inventario.
			</p>
		);
	}

	return (
		<div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">
					Movimientos de inventario
				</h1>
				<p className="text-muted-foreground text-sm">
					Historial completo de entradas, salidas y ajustes de productos ({total}{" "}
					en esta vista).
				</p>
			</div>

			<div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
				<Select
					value={movementType}
					onValueChange={(v) => {
						setMovementType(v as MovementType | "ALL");
						resetPage();
					}}
				>
					<SelectTrigger className="w-full cursor-pointer md:w-[180px]">
						<SelectValue placeholder="Tipo de movimiento" />
					</SelectTrigger>
					<SelectContent>
						{movementTypeOptions.map((o) => (
							<SelectItem
								key={o.value}
								value={o.value}
								className="cursor-pointer"
							>
								{o.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<ProductCombobox
					value={productId}
					onValueChange={(v) => {
						setProductId(v);
						resetPage();
					}}
				/>

				<SupplierCombobox
					value={supplierId}
					onValueChange={(v) => {
						setSupplierId(v);
						resetPage();
					}}
				/>

				<UserCombobox
					value={createdBy}
					onValueChange={(v) => {
						setCreatedBy(v);
						resetPage();
					}}
				/>

				<div className="relative min-w-[160px]">
					<IconCalendar className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="date"
						placeholder="Desde"
						className="pl-9"
						value={startDate}
						onChange={(e) => {
							setStartDate(e.target.value);
							resetPage();
						}}
					/>
				</div>

				<div className="relative min-w-[160px]">
					<IconCalendar className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="date"
						placeholder="Hasta"
						className="pl-9"
						value={endDate}
						onChange={(e) => {
							setEndDate(e.target.value);
							resetPage();
						}}
					/>
				</div>

				{hasActiveFilters && (
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="cursor-pointer"
						onClick={handleClearFilters}
					>
						Limpiar filtros
					</Button>
				)}

				<div className="flex items-center gap-2 md:ml-auto">
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="cursor-pointer"
						disabled={isExporting}
						onClick={() => handleExport("excel")}
					>
						<IconFileSpreadsheet className="mr-1 size-4" />
						{isExporting ? "Exportando..." : "Excel"}
					</Button>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="cursor-pointer"
						disabled={isExporting}
						onClick={() => handleExport("pdf")}
					>
						<IconFileText className="mr-1 size-4" />
						{isExporting ? "Exportando..." : "PDF"}
					</Button>
				</div>
			</div>

			<MovementsTable
				items={items}
				isLoading={isLoading}
				sortBy={sortBy}
				sortOrder={sortOrder}
				onSort={handleSort}
				onRowClick={handleRowClick}
			/>

			<DataTablePagination
				page={page}
				totalPages={totalPages}
				total={total}
				pageSize={pageSize}
				onPageChange={setPage}
				onPageSizeChange={setPageSize}
				itemLabel="movimiento"
			/>

			<MovementDetailDialog
				movementId={selectedMovementId}
				onClose={() => setSelectedMovementId(null)}
			/>
		</div>
	);
}

function MovementDetailDialog({
	movementId,
	onClose,
}: {
	movementId: string | null;
	onClose: () => void;
}) {
	const { data: movement } = useInventoryMovementDetail(movementId);

	return (
		<Dialog
			open={Boolean(movementId)}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Detalle del movimiento</DialogTitle>
				</DialogHeader>
				{movement ? (
					<div className="space-y-4">
						<div className="grid gap-2 sm:grid-cols-2 text-sm">
							<div>
								<span className="text-muted-foreground">Tipo:</span>{" "}
								<Badge
									variant={
										movement.type === "ENTRY"
											? "default"
											: movement.type === "EXIT"
												? "destructive"
												: "secondary"
									}
								>
									{MOVEMENT_TYPE_LABELS[movement.type]}
								</Badge>
							</div>
							<div>
								<span className="text-muted-foreground">Fecha:</span>{" "}
								{formatDateTime(movement.createdAt)}
							</div>
							<div className="sm:col-span-2">
								<span className="text-muted-foreground">Producto:</span>{" "}
								<strong>
									{movement.productName}{" "}
									<span className="font-mono text-muted-foreground text-xs">
										({movement.productCode})
									</span>
								</strong>
							</div>
							{movement.supplierName && (
								<div>
									<span className="text-muted-foreground">Proveedor:</span>{" "}
									{movement.supplierName}
								</div>
							)}
							<div>
								<span className="text-muted-foreground">Cantidad:</span>{" "}
								<strong>{movement.quantity}</strong>
							</div>
							{movement.previousQuantity !== null && (
								<div>
									<span className="text-muted-foreground">Stock anterior:</span>{" "}
									{movement.previousQuantity}
								</div>
							)}
							{movement.newQuantity !== null && (
								<div>
									<span className="text-muted-foreground">Stock nuevo:</span>{" "}
									{movement.newQuantity}
								</div>
							)}
							<div>
								<span className="text-muted-foreground">Responsable:</span>{" "}
								{movement.userFullName}
							</div>
							{movement.referenceId && (
								<div>
									<span className="text-muted-foreground">Documento ref.:</span>{" "}
									<Badge variant="outline" className="font-mono text-xs">
										{movement.referenceId}
									</Badge>
								</div>
							)}
							{movement.reason && (
								<div className="sm:col-span-2">
									<span className="text-muted-foreground">Motivo:</span>{" "}
									{movement.reason}
								</div>
							)}
						</div>
					</div>
				) : (
					<p className="text-sm text-muted-foreground">
						Cargando detalle del movimiento...
					</p>
				)}
			</DialogContent>
		</Dialog>
	);
}
