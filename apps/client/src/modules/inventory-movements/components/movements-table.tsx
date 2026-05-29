import {
	IconArrowDown,
	IconArrowsSort,
	IconArrowUp,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { InventoryMovement, MovementType } from "../types/api.js";

interface MovementsTableProps {
	items: InventoryMovement[];
	isLoading: boolean;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	onSort?: (column: string) => void;
	onRowClick?: (movement: InventoryMovement) => void;
}

const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
	ENTRY: "Entrada",
	EXIT: "Salida",
	ADJUSTMENT: "Ajuste",
};

const MOVEMENT_TYPE_VARIANTS: Record<
	MovementType,
	"default" | "destructive" | "secondary"
> = {
	ENTRY: "default",
	EXIT: "destructive",
	ADJUSTMENT: "secondary",
};

function formatDateTime(value: string): string {
	return new Date(value).toLocaleString("es-AR");
}

interface SortableHeadProps {
	label: string;
	column: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	onSort?: (column: string) => void;
}

function SortableHead({
	label,
	column,
	sortBy,
	sortOrder,
	onSort,
}: SortableHeadProps) {
	const isActive = sortBy === column;
	return (
		<TableHead>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="cursor-pointer -ml-3 h-auto p-2 hover:bg-transparent"
				onClick={() => onSort?.(column)}
			>
				<span>{label}</span>
				<span className="ml-1 opacity-60">
					{isActive ? (
						sortOrder === "asc" ? (
							<IconArrowUp className="size-3.5" />
						) : (
							<IconArrowDown className="size-3.5" />
						)
					) : (
						<IconArrowsSort className="size-3.5" />
					)}
				</span>
			</Button>
		</TableHead>
	);
}

function MovementTypeChip({ type }: { type: MovementType }) {
	const label = MOVEMENT_TYPE_LABELS[type];
	const variant = MOVEMENT_TYPE_VARIANTS[type];
	return <Badge variant={variant}>{label}</Badge>;
}

export function MovementsTable({
	items,
	isLoading,
	sortBy,
	sortOrder,
	onSort,
	onRowClick,
}: MovementsTableProps) {
	const colCount = 8;

	if (isLoading) {
		return (
			<div className="overflow-x-auto rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Fecha</TableHead>
							<TableHead>Tipo</TableHead>
							<TableHead>Producto</TableHead>
							<TableHead>Proveedor</TableHead>
							<TableHead className="text-right">Cantidad</TableHead>
							<TableHead>Documento ref.</TableHead>
							<TableHead>Responsable</TableHead>
							<TableHead>Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: 5 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
							<TableRow key={i}>
								{Array.from({ length: colCount }).map((__, j) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: skeleton cells
									<TableCell key={j}>
										<Skeleton className="h-4 w-full" />
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		);
	}

	if (items.length === 0) {
		return (
			<div className="overflow-x-auto rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Fecha</TableHead>
							<TableHead>Tipo</TableHead>
							<TableHead>Producto</TableHead>
							<TableHead>Proveedor</TableHead>
							<TableHead className="text-right">Cantidad</TableHead>
							<TableHead>Documento ref.</TableHead>
							<TableHead>Responsable</TableHead>
							<TableHead>Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell
								colSpan={colCount}
								className="text-center text-muted-foreground py-8"
							>
								No se encontraron movimientos con los filtros seleccionados.
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<SortableHead
							label="Fecha"
							column="createdAt"
							sortBy={sortBy}
							sortOrder={sortOrder}
							onSort={onSort}
						/>
						<TableHead>Tipo</TableHead>
						<SortableHead
							label="Producto"
							column="productName"
							sortBy={sortBy}
							sortOrder={sortOrder}
							onSort={onSort}
						/>
						<TableHead>Proveedor</TableHead>
						<SortableHead
							label="Cantidad"
							column="quantity"
							sortBy={sortBy}
							sortOrder={sortOrder}
							onSort={onSort}
							// className="text-right"
						/>
						<TableHead>Documento ref.</TableHead>
						<TableHead>Responsable</TableHead>
						<TableHead>Acciones</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.map((item) => (
						<TableRow
							key={item.id}
							className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
							onClick={() => onRowClick?.(item)}
						>
							<TableCell className="text-muted-foreground text-sm whitespace-nowrap">
								{formatDateTime(item.createdAt)}
							</TableCell>
							<TableCell>
								<MovementTypeChip type={item.type} />
							</TableCell>
							<TableCell>
								<div>
									<p className="font-medium truncate max-w-[200px]">
										{item.productName}
									</p>
									<p className="text-xs text-muted-foreground font-mono">
										{item.productCode}
									</p>
								</div>
							</TableCell>
							<TableCell className="text-muted-foreground truncate max-w-[160px]">
								{item.supplierName ?? "—"}
							</TableCell>
							<TableCell className="text-right tabular-nums">
								{item.quantity}
							</TableCell>
							<TableCell className="text-sm text-muted-foreground">
								{item.referenceId ? (
									<Badge variant="outline" className="font-mono text-xs">
										{item.referenceId.slice(-8)}
									</Badge>
								) : (
									"—"
								)}
							</TableCell>
							<TableCell className="text-sm">{item.userFullName}</TableCell>
							<TableCell>
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="cursor-pointer"
									onClick={(e) => {
										e.stopPropagation();
										onRowClick?.(item);
									}}
								>
									Detalle
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
